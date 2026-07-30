#!/usr/bin/env python3
"""Live PowerMem memory-lifecycle demo.

The application serves a small browser UI and executes every demo operation
against one real PowerMem memory in a dedicated SeekDB scope. The browser never
receives database credentials and can mutate only that fixed scope.
"""

from __future__ import annotations

import argparse
import json
import math
import os
import threading
import time
import traceback
from copy import deepcopy
from datetime import datetime, timedelta, timezone
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any, Callable
from urllib.parse import urlparse


USER_ID = "demo-atlas-user"
AGENT_ID = "demo-memory-agent"
RUN_ID = "atlas-memory-lifecycle-demo"
MEMORY_ROLE = "atlas-payment-rule"
MEMORY_LABEL = "Atlas 支付规则"
MEMORY_CONTENT = (
    "Atlas 项目的支付请求必须携带幂等键；"
    "重复请求直接返回首次处理结果。"
)
DEFAULT_QUERY = "Atlas 如何避免支付重试造成重复扣款？"
DEMO_IMPORTANCE = 0.5
PROMOTION_THRESHOLD = 3
MEMORY_TYPES = ("working", "short_term", "long_term")
MEMORY_TYPE_LABELS = {
    "working": "工作记忆",
    "short_term": "短期记忆",
    "long_term": "长期记忆",
}


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def iso(value: Any) -> str | None:
    if value is None:
        return None
    if isinstance(value, datetime):
        return value.isoformat()
    return str(value)


def parse_datetime(value: Any) -> datetime | None:
    if not value:
        return None
    if isinstance(value, datetime):
        parsed = value
    else:
        parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


class DemoEngine:
    """Serialize PowerMem operations for the fixed live-demo scope."""

    def __init__(self) -> None:
        password = os.environ.get("SEEKDB_ROOT_PASSWORD", "")
        if password and not os.environ.get("OCEANBASE_PASSWORD"):
            os.environ["OCEANBASE_PASSWORD"] = password

        # Imported lazily so local syntax checks do not require PowerMem.
        from server.services.memory_service import MemoryService

        self.service = MemoryService()
        self.memory = self.service.memory
        plugin = self.memory._intelligence_plugin
        if plugin is None or plugin._algo is None:
            raise RuntimeError("PowerMem intelligence plugin is not enabled")
        self.algorithm = plugin._algo
        self.lock = threading.RLock()
        self.event_sequence = 0

    def _event(
        self,
        kind: str,
        title: str,
        detail: str,
        *,
        method: str | None = None,
        target: str | None = None,
        duration_ms: int | None = None,
        status: int = 200,
        data: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        self.event_sequence += 1
        event = {
            "id": self.event_sequence,
            "timestamp": utc_now().isoformat(),
            "kind": kind,
            "title": title,
            "detail": detail,
            "method": method,
            "target": target,
            "durationMs": duration_ms,
            "status": status,
        }
        if data is not None:
            event["data"] = data
        return event

    def _all_records(self) -> list[dict[str, Any]]:
        response = self.memory.get_all(
            user_id=USER_ID,
            agent_id=AGENT_ID,
            run_id=RUN_ID,
            limit=10,
            sort_by="created_at",
            order="asc",
        )
        return list(response.get("results", []))

    def _record(self) -> dict[str, Any]:
        records = self._all_records()
        matching = [
            record
            for record in records
            if (record.get("metadata") or {}).get("demo_role") == MEMORY_ROLE
        ]
        if not records:
            raise ValueError("请先写入 Atlas 支付规则。")
        if len(records) != 1 or len(matching) != 1:
            raise RuntimeError(
                "Demo scope 必须且只能包含一条 Atlas 支付规则；"
                "请点击“重新开始”清空后再写入。"
            )
        return matching[0]

    def _patch_metadata(
        self,
        memory_id: int,
        mutation: Callable[[dict[str, Any]], None],
    ) -> dict[str, Any]:
        record = self.memory.storage.get_memory(memory_id, USER_ID, AGENT_ID)
        if record is None or record.get("run_id") != RUN_ID:
            raise ValueError("只能修改当前 Demo 沙箱中的记忆。")
        metadata = deepcopy(record.get("metadata") or {})
        mutation(metadata)
        self.memory.storage.update_memory(
            memory_id,
            {"metadata": metadata, "updated_at": utc_now()},
            USER_ID,
            AGENT_ID,
        )
        updated = self.memory.storage.get_memory(memory_id, USER_ID, AGENT_ID)
        if updated is None:
            raise RuntimeError(f"Memory {memory_id} disappeared after update")
        return updated

    def _prepare_new_memory(self, memory_id: int) -> None:
        """Set one deterministic starting point using PowerMem's algorithm."""

        generated = self.algorithm.process_memory_metadata(
            MEMORY_CONTENT,
            DEMO_IMPORTANCE,
            "working",
        )

        def mutate(metadata: dict[str, Any]) -> None:
            metadata.update(
                {
                    "demo": "memory-lifecycle-live",
                    "demo_role": MEMORY_ROLE,
                    "importance_score": DEMO_IMPORTANCE,
                    "memory_type": "working",
                    "access_count": 0,
                    "archived": False,
                    "should_forget": False,
                    "intelligence": deepcopy(generated["intelligence"]),
                    "memory_management": deepcopy(
                        generated["memory_management"]
                    ),
                }
            )
            metadata.pop("search_count", None)
            metadata.pop("last_searched_at", None)

        self._patch_metadata(memory_id, mutate)

    def _memory_view(self, record: dict[str, Any]) -> dict[str, Any]:
        metadata = record.get("metadata") or {}
        intelligence = metadata.get("intelligence") or {}
        observed_at = utc_now()
        last_reviewed = parse_datetime(intelligence.get("last_reviewed"))
        age_hours = (
            max(0.0, (observed_at - last_reviewed).total_seconds() / 3600)
            if last_reviewed
            else 0.0
        )
        next_review = parse_datetime(intelligence.get("next_review"))
        if next_review is None:
            next_review_status = "none"
            next_review_due = False
            next_review_delta_seconds = None
        else:
            next_review_delta_seconds = (
                next_review - observed_at
            ).total_seconds()
            next_review_due = next_review_delta_seconds <= 0
            next_review_status = "due" if next_review_due else "scheduled"
        memory_type = metadata.get("memory_type", "working")
        effective_retention = self.algorithm.calculate_current_retention(record)
        effective_decay_rate = self.algorithm._resolve_decay_rate(record)
        return {
            "id": str(record.get("id") or record.get("memory_id")),
            "role": metadata.get("demo_role") or MEMORY_ROLE,
            "label": MEMORY_LABEL,
            "content": record.get("content") or record.get("memory") or "",
            "memoryType": memory_type,
            "memoryTypeLabel": MEMORY_TYPE_LABELS.get(
                memory_type,
                memory_type,
            ),
            "importance": float(
                metadata.get("importance_score") or DEMO_IMPORTANCE
            ),
            "initialRetention": float(
                intelligence.get("initial_retention") or 0
            ),
            "storedRetention": float(
                intelligence.get("current_retention") or 0
            ),
            "effectiveRetention": float(effective_retention),
            "lastReviewed": iso(intelligence.get("last_reviewed")),
            "nextReview": iso(intelligence.get("next_review")),
            "nextReviewDue": next_review_due,
            "nextReviewDeltaSeconds": next_review_delta_seconds,
            "nextReviewStatus": next_review_status,
            "ageHours": age_hours,
            "reviewCount": int(intelligence.get("review_count") or 0),
            "accessCount": int(metadata.get("access_count") or 0),
            "decayRate": float(
                self.algorithm._get_decay_rate_for_type(memory_type)
            ),
            "effectiveDecayRate": float(effective_decay_rate),
            "reinforcementFactor": float(
                intelligence.get("reinforcement_factor")
                if intelligence.get("reinforcement_factor") is not None
                else self.algorithm.reinforcement_factor
            ),
        }

    @staticmethod
    def _snapshot_change(
        before: dict[str, Any],
        after: dict[str, Any],
    ) -> dict[str, Any]:
        before_snapshot = float(before["storedRetention"])
        after_snapshot = float(after["storedRetention"])
        return {
            "field": "current_retention",
            "before": before_snapshot,
            "after": after_snapshot,
            "changed": not math.isclose(
                before_snapshot,
                after_snapshot,
                rel_tol=0.0,
                abs_tol=1e-12,
            ),
        }

    @staticmethod
    def _next_review_event_view(memory: dict[str, Any]) -> dict[str, Any]:
        return {
            "at": memory["nextReview"],
            "status": memory["nextReviewStatus"],
            "due": memory["nextReviewDue"],
            "deltaSeconds": memory["nextReviewDeltaSeconds"],
        }

    @staticmethod
    def _effective_time_scale_calculation(
        memory: dict[str, Any],
    ) -> dict[str, Any]:
        return {
            "formula": (
                "decay_rate = base_rate * "
                "(1 + reinforcement_factor * log1p(access_count))"
            ),
            "operands": {
                "base_rate": float(memory["decayRate"]),
                "reinforcement_factor": float(
                    memory["reinforcementFactor"]
                ),
                "access_count": int(memory["accessCount"]),
            },
            "decay_rate": float(memory["effectiveDecayRate"]),
        }

    def _state(self) -> dict[str, Any]:
        records = self._all_records()
        matching = [
            record
            for record in records
            if (record.get("metadata") or {}).get("demo_role") == MEMORY_ROLE
        ]
        memory = self._memory_view(matching[0]) if len(matching) == 1 else None
        tiers = [
            {
                "id": memory_type,
                "label": MEMORY_TYPE_LABELS[memory_type],
                "decayRate": float(
                    self.algorithm._get_decay_rate_for_type(memory_type)
                ),
            }
            for memory_type in MEMORY_TYPES
        ]
        return {
            "ready": memory is not None and len(records) == 1,
            "scope": {
                "userId": USER_ID,
                "agentId": AGENT_ID,
                "runId": RUN_ID,
                "collection": os.environ.get(
                    "OCEANBASE_COLLECTION",
                    "memories_decay_demo",
                ),
            },
            "defaultQuery": DEFAULT_QUERY,
            "memory": memory,
            "tiers": tiers,
            "promotionThreshold": PROMOTION_THRESHOLD,
            "sourceBehavior": (
                "Memory.search 命中后自动执行访问反馈。PowerMem 使用本次访问前的 "
                "access_count 判断晋升：旧计数达到 3 时 working → short_term，"
                "下一次命中 short_term → long_term。"
            ),
        }

    def status(self) -> dict[str, Any]:
        with self.lock:
            return self._state()

    def reset(self) -> dict[str, Any]:
        with self.lock:
            started = time.perf_counter()
            self.memory.delete_all(
                user_id=USER_ID,
                agent_id=AGENT_ID,
                run_id=RUN_ID,
            )
            if self._all_records():
                raise RuntimeError(
                    f"PowerMem did not clear the demo scope {RUN_ID}"
                )
            self.event_sequence = 0
            event = self._event(
                "request",
                "Demo scope 已清空",
                "固定实验范围中当前没有演示记忆，等待用户重新写入。",
                method="DELETE",
                target="Memory.delete_all",
                duration_ms=round(
                    (time.perf_counter() - started) * 1000
                ),
            )
            return {
                "state": self._state(),
                "events": [event],
                "eventLogCleared": True,
            }

    def add(self) -> dict[str, Any]:
        with self.lock:
            if self._all_records():
                raise ValueError(
                    "当前实验已经包含一条记忆；请先点击“重新开始”。"
                )

            started = time.perf_counter()
            response = self.memory.add(
                MEMORY_CONTENT,
                user_id=USER_ID,
                agent_id=AGENT_ID,
                run_id=RUN_ID,
                metadata={
                    "demo": "memory-lifecycle-live",
                    "demo_role": MEMORY_ROLE,
                },
                infer=False,
            )
            results = list(response.get("results") or [])
            if len(results) != 1 or not results[0].get("id"):
                raise RuntimeError(
                    "Memory.add 必须为固定 Demo 文本返回且只返回一条记忆。"
                )
            memory_id = int(results[0]["id"])
            self._prepare_new_memory(memory_id)
            state = self._state()
            memory = state.get("memory")
            if (
                not state["ready"]
                or memory is None
                or memory["memoryType"] != "working"
                or memory["accessCount"] != 0
                or memory["reviewCount"] != 0
                or not math.isclose(
                    memory["initialRetention"],
                    DEMO_IMPORTANCE,
                    abs_tol=1e-6,
                )
                or not math.isclose(
                    memory["storedRetention"],
                    DEMO_IMPORTANCE,
                    abs_tol=1e-6,
                )
            ):
                raise RuntimeError(
                    "PowerMem 配置未生成 Demo 需要的确定性初始状态；"
                    "请点击“重新开始”清空这条半初始化记忆。"
                )
            max_retention = max(
                0.0,
                min(1.0, float(self.algorithm.initial_retention)),
            )
            retention_floor = min(
                max_retention,
                max(
                    0.0,
                    min(1.0, float(self.algorithm.working_threshold)),
                ),
            )
            initial_retention = float(
                self.algorithm._calculate_initial_retention(DEMO_IMPORTANCE)
            )
            events = [
                self._event(
                    "request",
                    "写入 Atlas 支付规则",
                    f"Memory.add 创建 Memory ID {memory_id}。",
                    method="POST",
                    target="Memory.add",
                    duration_ms=round(
                        (time.perf_counter() - started) * 1000
                    ),
                    status=201,
                ),
                self._event(
                    "state",
                    "建立可重复的初始状态",
                    (
                        "importance_score=0.500 → "
                        "initial_retention=0.500；"
                        "初始状态为 working、access_count=0。"
                    ),
                    method="PATCH",
                    target=(
                        "Ebbinghaus.process_memory_metadata → "
                        "storage.update_memory"
                    ),
                    data={
                        "operation": "initial_retention",
                        "calculation": {
                            "formula": (
                                "initial_retention = max("
                                "max_retention * importance_score, "
                                "retention_floor)"
                            ),
                            "operands": {
                                "max_retention": max_retention,
                                "importance_score": DEMO_IMPORTANCE,
                                "retention_floor": retention_floor,
                            },
                            "calculated_result": initial_retention,
                            "observed_result": float(
                                memory["initialRetention"]
                            ),
                        },
                    },
                ),
            ]
            return {
                "state": state,
                "events": events,
                "createdId": str(memory_id),
            }

    def advance_time(self, hours: float) -> dict[str, Any]:
        if not math.isfinite(hours) or hours <= 0 or hours > 720:
            raise ValueError("模拟时长必须在 0 到 720 小时之间。")

        with self.lock:
            record = self._record()
            memory_id = int(record.get("id") or record.get("memory_id"))
            before = self._memory_view(record)
            simulated_now = utc_now()
            shifted_anchor = simulated_now - timedelta(hours=hours)

            def mutate(metadata: dict[str, Any]) -> None:
                intelligence = metadata.setdefault("intelligence", {})
                intelligence["last_reviewed"] = shifted_anchor.isoformat()
                # next_review is an on-access eligibility gate, not a timer.
                intelligence["next_review"] = (
                    simulated_now - timedelta(seconds=1)
                ).isoformat()

            updated = self._patch_metadata(memory_id, mutate)
            after = self._memory_view(updated)
            current_retention = float(after["storedRetention"])
            hours_elapsed = float(after["ageHours"])
            decay_rate = float(after["effectiveDecayRate"])
            t_days = hours_elapsed / 24
            s_days = decay_rate
            decay_factor = math.exp(
                -hours_elapsed / (24 * decay_rate)
            )
            effective_retention = max(
                0.0,
                min(1.0, current_retention * decay_factor),
            )
            event = self._event(
                "time",
                f"模拟经过 {hours:g} 小时",
                (
                    f"{after['memoryTypeLabel']}的未强化时间增加 "
                    f"{hours:g} 小时；记忆保留率 "
                    f"{before['effectiveRetention']:.3f} → "
                    f"{after['effectiveRetention']:.3f}。"
                    "current_retention 快照、计数与层级均保持不变。"
                ),
                method="PATCH",
                target="storage.update_memory",
                data={
                    "operation": "time_decay",
                    "calculation": {
                        "formula": "R(t) = R0 * exp(-t / S)",
                        "operands": {
                            "current_retention": current_retention,
                            "hours_elapsed": hours_elapsed,
                            "decay_rate": decay_rate,
                            "t_days": t_days,
                            "s_days": s_days,
                        },
                        "decay_factor": decay_factor,
                        "calculated_result": effective_retention,
                        "observed_result": float(
                            after["effectiveRetention"]
                        ),
                    },
                    "currentRetentionSnapshot": self._snapshot_change(
                        before,
                        after,
                    ),
                    "nextReview": {
                        "before": self._next_review_event_view(before),
                        "after": self._next_review_event_view(after),
                    },
                },
            )
            return {
                "state": self._state(),
                "events": [event],
                "advancedHours": hours,
                "change": {
                    "before": before,
                    "after": after,
                },
            }

    @staticmethod
    def _base_score(result: dict[str, Any]) -> float:
        metadata = result.get("metadata") or {}
        explanation = metadata.get("search_explanation") or {}
        ranking_score = explanation.get("ranking_score")
        if ranking_score is None:
            raise RuntimeError(
                "PowerMem search result did not include the requested "
                "RRF ranking_score explanation"
            )
        score = float(ranking_score)
        if score <= 0:
            raise RuntimeError(
                f"PowerMem returned an invalid RRF ranking_score: {score}"
            )
        return score

    def _search_result_view(
        self,
        result: dict[str, Any],
    ) -> dict[str, Any]:
        metadata = result.get("metadata") or {}
        explanation = metadata.get("search_explanation") or {}
        original_score = self._base_score(result)
        if result.get("score") is None:
            raise RuntimeError("PowerMem search result did not include a score")
        final_score = float(result["score"])
        effective_retention = final_score / original_score
        return {
            "id": str(result.get("id") or result.get("memory_id")),
            "content": result.get("memory") or result.get("content") or "",
            "originalScore": original_score,
            "effectiveRetention": effective_retention,
            "finalScore": final_score,
            "vectorRank": explanation.get("vector_rank"),
            "ftsRank": explanation.get("fts_rank"),
            "rrfK": explanation.get("rrf_k"),
            "fusionMethod": explanation.get("fusion_method"),
        }

    def _wait_for_access(
        self,
        previous_access_count: int,
        timeout: float = 20.0,
    ) -> dict[str, Any]:
        deadline = time.monotonic() + timeout
        state = self._state()
        while time.monotonic() < deadline:
            memory = state.get("memory")
            if (
                memory is not None
                and memory["accessCount"] > previous_access_count
            ):
                return state
            time.sleep(0.1)
            state = self._state()
        raise RuntimeError(
            "PowerMem search returned the demo memory, but its access update "
            f"was not persisted within {timeout:g} seconds"
        )

    def search(self, query: str) -> dict[str, Any]:
        query = query.strip()
        if not query:
            raise ValueError("请输入搜索问题。")
        if len(query) > 160:
            raise ValueError("搜索问题不能超过 160 个字符。")

        with self.lock:
            before_state = self._state()
            before = before_state.get("memory")
            if not before_state["ready"] or before is None:
                raise ValueError("请先写入 Atlas 支付规则。")

            started = time.perf_counter()
            response = self.memory.search(
                query,
                user_id=USER_ID,
                agent_id=AGENT_ID,
                run_id=RUN_ID,
                limit=1,
                retrieval_mode="hybrid",
                fusion="rrf",
                include_explanation=True,
            )
            duration_ms = round((time.perf_counter() - started) * 1000)
            raw_results = list(response.get("results", []))
            result = (
                self._search_result_view(raw_results[0])
                if raw_results
                else None
            )

            after_state = (
                self._wait_for_access(before["accessCount"])
                if result is not None
                else before_state
            )
            after = after_state.get("memory")
            if after is None:
                raise RuntimeError("Demo memory disappeared after search")

            reinforcement_applied = (
                after["reviewCount"] > before["reviewCount"]
            )
            promoted_from = (
                before["memoryType"]
                if before["memoryType"] != after["memoryType"]
                else None
            )
            promoted_to = (
                after["memoryType"] if promoted_from is not None else None
            )
            snapshot_change = self._snapshot_change(before, after)
            access_event_data: dict[str, Any] = {
                "operation": "search_access",
                "accessCount": {
                    "before": int(before["accessCount"]),
                    "after": int(after["accessCount"]),
                },
                "reinforcementApplied": reinforcement_applied,
            }
            if not reinforcement_applied:
                next_review_status = before["nextReviewStatus"]
                if next_review_status == "scheduled":
                    reason_code = "next_review_not_due"
                    reason_message = (
                        "当前访问早于 next_review，"
                        "因此不更新 current_retention 快照。"
                    )
                elif next_review_status == "none":
                    reason_code = "no_next_review_scheduled"
                    reason_message = (
                        "当前记忆没有待执行的 next_review，"
                        "因此本次仅记录普通访问。"
                    )
                else:
                    reason_code = "reinforcement_not_observed"
                    reason_message = (
                        "next_review 条件已满足，"
                        "但未观察到 review_count 变化。"
                    )
                access_event_data.update(
                    {
                        "reason": {
                            "code": reason_code,
                            "message": reason_message,
                        },
                        "nextReview": {
                            "before": self._next_review_event_view(before),
                            "after": self._next_review_event_view(after),
                        },
                        "currentRetentionSnapshot": snapshot_change,
                        "reviewCount": {
                            "before": int(before["reviewCount"]),
                            "after": int(after["reviewCount"]),
                            "changed": (
                                before["reviewCount"]
                                != after["reviewCount"]
                            ),
                        },
                        "effectiveTimeScale": {
                            "before": (
                                self._effective_time_scale_calculation(
                                    before
                                )
                            ),
                            "after": (
                                self._effective_time_scale_calculation(
                                    after
                                )
                            ),
                        },
                    }
                )

            events = [
                self._event(
                    "request",
                    "用户提出问题",
                    f'query="{query}"，PowerMem 返回 {len(raw_results)} 条记忆。',
                    method="POST",
                    target="Memory.search",
                    duration_ms=duration_ms,
                )
            ]
            if result is not None:
                events.append(
                    self._event(
                        "access",
                        "搜索命中自动产生访问反馈",
                        (
                            f"access_count {before['accessCount']} → "
                            f"{after['accessCount']}。"
                        ),
                        target="IntelligencePlugin.on_search/on_get",
                        data=access_event_data,
                    )
                )
            if reinforcement_applied:
                current_retention = float(
                    result["effectiveRetention"]
                    if result is not None
                    else before["effectiveRetention"]
                )
                reinforcement_factor = float(
                    before["reinforcementFactor"]
                )
                calculated_new_retention = min(
                    1.0,
                    current_retention
                    + reinforcement_factor * (1.0 - current_retention),
                )
                persisted_new_retention = float(after["storedRetention"])
                events.append(
                    self._event(
                        "reinforcement",
                        "到达复习时间，自动强化",
                        (
                            f"review_count {before['reviewCount']} → "
                            f"{after['reviewCount']}；记忆保留率 "
                            f"{current_retention:.3f} → "
                            f"{persisted_new_retention:.3f}，"
                            f"新的 current_retention 快照为 "
                            f"{after['storedRetention']:.3f}。"
                        ),
                        target="Ebbinghaus.reinforce",
                        data={
                            "operation": "review_reinforcement",
                            "calculation": {
                                "formula": (
                                    "new_retention = min("
                                    "1.0, current_retention + "
                                    "reinforcement_factor * "
                                    "(1.0 - current_retention))"
                                ),
                                "operands": {
                                    "current_retention": current_retention,
                                    "reinforcement_factor": (
                                        reinforcement_factor
                                    ),
                                },
                                "calculated_result": (
                                    calculated_new_retention
                                ),
                                "persisted_result": (
                                    persisted_new_retention
                                ),
                                "difference": (
                                    persisted_new_retention
                                    - calculated_new_retention
                                ),
                            },
                            "reviewCount": {
                                "before": int(before["reviewCount"]),
                                "after": int(after["reviewCount"]),
                            },
                            "currentRetentionSnapshot": snapshot_change,
                            "nextReview": {
                                "before": (
                                    self._next_review_event_view(before)
                                ),
                                "after": (
                                    self._next_review_event_view(after)
                                ),
                            },
                        },
                    )
                )
            if promoted_from is not None and promoted_to is not None:
                events.append(
                    self._event(
                        "promotion",
                        "访问驱动记忆晋升",
                        (
                            f"{MEMORY_TYPE_LABELS[promoted_from]} → "
                            f"{MEMORY_TYPE_LABELS[promoted_to]}；衰减时间尺度 "
                            f"{before['decayRate']:g} 天 → "
                            f"{after['decayRate']:g} 天。"
                        ),
                        target="Ebbinghaus.should_promote",
                    )
                )
            elif (
                after["memoryType"] == "working"
                and after["accessCount"] == PROMOTION_THRESHOLD
            ):
                events.append(
                    self._event(
                        "state",
                        "访问阈值已经满足",
                        "下一次搜索命中会执行 working → short_term。",
                        target="Ebbinghaus.should_promote",
                    )
                )

            return {
                "state": after_state,
                "events": events,
                "change": {
                    "before": before,
                    "after": after,
                },
                "search": {
                    "query": query,
                    "durationMs": duration_ms,
                    "resultCount": len(raw_results),
                    "result": result,
                    "reinforcementApplied": reinforcement_applied,
                    "promotedFrom": promoted_from,
                    "promotedTo": promoted_to,
                },
            }


class DemoHandler(SimpleHTTPRequestHandler):
    server_version = "PowerMemLiveDemo/3.0"
    engine: DemoEngine

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store, max-age=0")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "SAMEORIGIN")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header(
            "Content-Security-Policy",
            "default-src 'self'; style-src 'self'; script-src 'self'; "
            "img-src 'self' data:; connect-src 'self'; frame-ancestors 'self'",
        )
        super().end_headers()

    def _send_json(
        self,
        payload: dict[str, Any],
        status: HTTPStatus = HTTPStatus.OK,
    ) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _read_json(self) -> dict[str, Any]:
        content_length = int(self.headers.get("Content-Length", "0"))
        if content_length > 16_384:
            raise ValueError("请求内容过大。")
        if content_length == 0:
            return {}
        payload = self.rfile.read(content_length)
        try:
            parsed = json.loads(payload)
        except json.JSONDecodeError as error:
            raise ValueError("请求必须是有效的 JSON。") from error
        if not isinstance(parsed, dict):
            raise ValueError("请求 JSON 必须是对象。")
        return parsed

    def do_GET(self) -> None:  # noqa: N802 - stdlib handler API
        path = urlparse(self.path).path
        if path == "/healthz":
            self._send_json(
                {
                    "status": "ok",
                    "service": "powermem-live-demo",
                    "collection": os.environ.get(
                        "OCEANBASE_COLLECTION",
                        "memories_decay_demo",
                    ),
                }
            )
            return
        if path == "/api/status":
            try:
                self._send_json({"success": True, "data": self.engine.status()})
            except Exception as error:  # pragma: no cover - integration boundary
                self._send_error(error)
            return
        if path == "/":
            self.path = "/index.html"
        super().do_GET()

    def do_POST(self) -> None:  # noqa: N802 - stdlib handler API
        path = urlparse(self.path).path
        try:
            payload = self._read_json()
            if path == "/api/reset":
                data = self.engine.reset()
            elif path == "/api/add":
                data = self.engine.add()
            elif path == "/api/age":
                data = self.engine.advance_time(
                    float(payload.get("hours", 24))
                )
            elif path == "/api/search":
                data = self.engine.search(str(payload.get("query", "")))
            else:
                self._send_json(
                    {"success": False, "message": "API endpoint not found"},
                    HTTPStatus.NOT_FOUND,
                )
                return
            self._send_json({"success": True, "data": data})
        except (TypeError, ValueError) as error:
            self._send_json(
                {"success": False, "message": str(error)},
                HTTPStatus.BAD_REQUEST,
            )
        except Exception as error:  # pragma: no cover - integration boundary
            self._send_error(error)

    def _send_error(self, error: Exception) -> None:
        traceback.print_exc()
        self._send_json(
            {
                "success": False,
                "message": "Demo 后端执行失败，请查看服务日志。",
                "detail": str(error),
            },
            HTTPStatus.INTERNAL_SERVER_ERROR,
        )

    def log_message(self, format: str, *args: object) -> None:
        print(f"{self.address_string()} - {format % args}", flush=True)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=8080)
    parser.add_argument(
        "--directory",
        type=Path,
        default=Path(__file__).resolve().parent / "static",
    )
    args = parser.parse_args()

    directory = args.directory.resolve()
    if not (directory / "index.html").is_file():
        raise SystemExit(f"Demo assets not found in {directory}")

    engine = DemoEngine()
    DemoHandler.engine = engine
    handler = lambda *handler_args, **handler_kwargs: DemoHandler(  # noqa: E731
        *handler_args,
        directory=str(directory),
        **handler_kwargs,
    )
    server = ThreadingHTTPServer((args.host, args.port), handler)
    print(
        f"Serving live PowerMem demo on http://{args.host}:{args.port}",
        flush=True,
    )
    server.serve_forever()


if __name__ == "__main__":
    main()
