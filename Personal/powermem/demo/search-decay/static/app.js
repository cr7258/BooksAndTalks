const elements = {
  workspace: document.querySelector("#workspace"),
  connection: document.querySelector("#connection-status"),
  resetButton: document.querySelector("#reset-button"),
  resetLabel: document.querySelector("#reset-label"),
  journeySteps: document.querySelectorAll(".journey li"),
  memoryHeading: document.querySelector("#memory-heading"),
  memoryId: document.querySelector("#memory-id"),
  memoryTierBadge: document.querySelector("#memory-tier-badge"),
  retentionValue: document.querySelector("#retention-value"),
  retentionContext: document.querySelector("#retention-context"),
  retentionTrack: document.querySelector("#retention-track"),
  accessCount: document.querySelector("#access-count"),
  reviewCount: document.querySelector("#review-count"),
  memoryAge: document.querySelector("#memory-age"),
  reviewSchedule: document.querySelector("#review-schedule"),
  nextReviewRelative: document.querySelector("#next-review-relative"),
  nextReviewTime: document.querySelector("#next-review-time"),
  tierStages: document.querySelectorAll("#tier-track article"),
  tierArrows: document.querySelectorAll("#tier-track > svg"),
  addForm: document.querySelector("#add-form"),
  addButton: document.querySelector("#add-button"),
  ageForm: document.querySelector("#age-form"),
  ageButton: document.querySelector("#age-button"),
  searchForm: document.querySelector("#search-form"),
  searchButton: document.querySelector("#search-button"),
  queryInput: document.querySelector("#query-input"),
  stepBadge: document.querySelector("#step-badge"),
  feedbackEmpty: document.querySelector("#feedback-empty"),
  feedbackContent: document.querySelector("#feedback-content"),
  searchDuration: document.querySelector("#search-duration"),
  semanticStatus: document.querySelector("#semantic-status"),
  searchRetention: document.querySelector("#search-retention"),
  feedbackOutcome: document.querySelector("#feedback-outcome"),
  feedbackOutcomeDetail: document.querySelector("#feedback-outcome-detail"),
  nextAction: document.querySelector("#next-action"),
  eventLog: document.querySelector("#event-log"),
  clearLog: document.querySelector("#clear-log"),
  toastRegion: document.querySelector("#toast-region"),
};

const templates = {
  event: document.querySelector("#event-template"),
};

const app = {
  state: null,
  observation: null,
  baselineScore: null,
  eventCount: 0,
  busy: false,
};

const tierOrder = ["working", "short_term", "long_term"];
const tierLabels = {
  working: "工作记忆",
  short_term: "短期记忆",
  long_term: "长期记忆",
};

const stageOrder = ["write", "decay", "reinforce", "promote", "verify"];

function formatPercent(value) {
  return (Number(value || 0) * 100).toFixed(1);
}

function formatTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function formatAge(hours) {
  const value = Number(hours || 0);
  if (value < 0.05) return "刚刚";
  if (value < 1) return `${Math.max(1, Math.round(value * 60))} 分钟`;
  if (value < 48) return `${value.toFixed(value >= 10 ? 0 : 1)} 小时`;
  return `${(value / 24).toFixed(1)} 天`;
}

function formatDecimal(value, digits = 4) {
  return Number(value || 0).toFixed(digits);
}

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const parts = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const part = (type) =>
    parts.find((item) => item.type === type)?.value || "";
  return (
    `${part("year")}-${part("month")}-${part("day")} ` +
    `${part("hour")}:${part("minute")}`
  );
}

function formatDuration(seconds) {
  const totalMinutes = Math.max(1, Math.ceil(Number(seconds || 0) / 60));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return hours > 0 ? `${days} 天 ${hours} 小时` : `${days} 天`;
  }
  if (hours > 0) {
    return minutes > 0 ? `${hours} 小时 ${minutes} 分` : `${hours} 小时`;
  }
  return `${minutes} 分钟`;
}

function formatCompactDuration(seconds) {
  const totalMinutes = Math.max(1, Math.ceil(Number(seconds || 0) / 60));
  if (totalMinutes < 60) return `${totalMinutes} 分钟后`;
  const hours = Math.ceil(totalMinutes / 60);
  if (hours < 24) return `${hours} 小时后`;
  return `${Math.ceil(hours / 24)} 天后`;
}

function formatMetricDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const pad = (number) => String(number).padStart(2, "0");
  return (
    `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

function resolveNextReview(memory) {
  if (!memory?.nextReview) {
    return { state: "none", deltaSeconds: null };
  }
  const target = new Date(memory.nextReview);
  if (Number.isNaN(target.getTime())) {
    return { state: "none", deltaSeconds: null };
  }
  const deltaSeconds = (target.getTime() - Date.now()) / 1000;
  return {
    state: deltaSeconds <= 0 ? "due" : "scheduled",
    deltaSeconds,
  };
}

function renderReviewSchedule(memory) {
  if (!memory) {
    elements.reviewSchedule.dataset.state = "unavailable";
    elements.reviewSchedule.title = "写入记忆后显示下次强化时间";
    elements.reviewSchedule.setAttribute(
      "aria-label",
      "下次强化：等待写入记忆",
    );
    elements.nextReviewRelative.textContent = "—";
    elements.nextReviewTime.textContent = "—";
    elements.nextReviewTime.removeAttribute("datetime");
    return;
  }

  const review = resolveNextReview(memory);
  elements.reviewSchedule.dataset.state = review.state;

  if (review.state === "none") {
    elements.reviewSchedule.title =
      "next_review 为空；访问仍会累计，但不会再触发保留率强化";
    elements.reviewSchedule.setAttribute(
      "aria-label",
      "下次强化：当前没有后续强化计划",
    );
    elements.nextReviewRelative.textContent = "无计划";
    elements.nextReviewTime.textContent = "null";
    elements.nextReviewTime.removeAttribute("datetime");
    return;
  }

  elements.nextReviewTime.dateTime = memory.nextReview;
  if (review.state === "due") {
    elements.reviewSchedule.title =
      "next_review 条件已满足；下一次访问这条记忆时触发强化";
    elements.reviewSchedule.setAttribute(
      "aria-label",
      "下次强化：条件已满足，等待下一次访问触发",
    );
    elements.nextReviewRelative.textContent = "待访问触发";
    elements.nextReviewTime.textContent = "条件已满足";
    return;
  }

  const relative = formatCompactDuration(review.deltaSeconds);
  const exactTime = formatMetricDateTime(memory.nextReview);
  elements.reviewSchedule.title =
    `预计 ${relative}进入强化窗口（${formatDateTime(memory.nextReview)}）；` +
    "到时需再次访问才会触发";
  elements.reviewSchedule.setAttribute(
    "aria-label",
    `下次强化：${relative}，${exactTime}`,
  );
  elements.nextReviewRelative.textContent = relative;
  elements.nextReviewTime.textContent = exactTime;
}

function setConnection(state, text) {
  elements.connection.dataset.state = state;
  elements.connection.querySelector("span").textContent = text;
}

function setButtonText(button, text) {
  const label = button.querySelector("span") || button;
  label.textContent = text;
}

function setButtonLoading(button, loading, text) {
  button.dataset.loading = String(loading);
  if (loading) {
    button.dataset.idleText =
      (button.querySelector("span") || button).textContent;
    setButtonText(button, text);
  } else if (button.dataset.idleText) {
    setButtonText(button, button.dataset.idleText);
    delete button.dataset.idleText;
  }
}

function setBusy(busy, activeButton = null, loadingText = "") {
  app.busy = busy;
  elements.workspace.setAttribute("aria-busy", String(busy));
  [
    elements.resetButton,
    elements.addButton,
    elements.ageButton,
    elements.searchButton,
    elements.queryInput,
  ].forEach((control) => {
    control.disabled = busy;
  });
  if (activeButton) {
    setButtonLoading(activeButton, busy, loadingText);
  }
  if (!busy) {
    renderControls();
  }
}

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toast.setAttribute("role", type === "error" ? "alert" : "status");
  elements.toastRegion.append(toast);
  window.setTimeout(() => toast.remove(), 4200);
}

async function request(path, options = {}) {
  const response = await fetch(path, {
    method: options.method || "GET",
    headers: options.body ? { "Content-Type": "application/json" } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });
  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || `HTTP ${response.status}`);
  }
  return payload.data;
}

function derivePhase() {
  const state = app.state;
  const memory = state?.memory;
  if (!state?.ready || !memory) return "reset";

  const aged = Number(memory.ageHours || 0) >= 20;
  if (memory.memoryType === "long_term") {
    if (aged) return "long-aged";
    if (memory.reviewCount >= 2 && memory.accessCount >= 6) return "done";
    return "long";
  }
  if (memory.memoryType === "short_term") return "short";
  if (memory.accessCount >= 3) return "threshold";
  if (memory.accessCount === 2) return "verified";
  if (memory.accessCount === 1) return "reinforced";
  return aged ? "decayed" : "fresh";
}

function stageForPhase(phase) {
  const mapping = {
    reset: "write",
    fresh: "decay",
    decayed: "reinforce",
    reinforced: "reinforce",
    verified: "promote",
    threshold: "promote",
    short: "promote",
    long: "verify",
    "long-aged": "verify",
    done: null,
  };
  return mapping[phase];
}

function renderJourney() {
  const phase = derivePhase();
  const currentStage = stageForPhase(phase);
  const currentIndex =
    currentStage === null ? stageOrder.length : stageOrder.indexOf(currentStage);

  elements.journeySteps.forEach((step) => {
    const index = stageOrder.indexOf(step.dataset.stage);
    const state =
      currentStage === null || index < currentIndex
        ? "complete"
        : index === currentIndex
          ? "current"
          : "upcoming";
    step.dataset.state = state;
    if (state === "current") {
      step.setAttribute("aria-current", "step");
    } else {
      step.removeAttribute("aria-current");
    }
  });
}

function retentionContextForPhase(phase) {
  const copy = {
    reset: "等待 PowerMem 数据",
    fresh: "初始值 · importance_score 0.50",
    decayed: "工作记忆经过 24 小时",
    reinforced: "第一次命中强化后",
    verified: "强化已用于下一次检索",
    threshold: "已满足下一次晋升条件",
    short: "衰减时间尺度已延长",
    long: "长期记忆刚完成晋升",
    "long-aged": "长期记忆经过 24 小时",
    done: "第二次访问强化后",
  };
  return copy[phase];
}

function renderMemory() {
  const memory = app.state?.memory;
  const phase = derivePhase();

  if (!memory) {
    elements.memoryHeading.textContent =
      "Atlas 项目的支付请求必须携带幂等键；重复请求直接返回首次处理结果。";
    elements.memoryId.textContent = "等待写入";
    elements.memoryTierBadge.dataset.tier = "empty";
    elements.memoryTierBadge.textContent = "未写入";
    elements.retentionValue.textContent = "—";
    elements.retentionContext.textContent = retentionContextForPhase(phase);
    elements.retentionTrack.querySelector("i").style.width = "0%";
    elements.retentionTrack.setAttribute("aria-valuenow", "0");
    elements.accessCount.textContent = "—";
    elements.reviewCount.textContent = "—";
    elements.memoryAge.textContent = "—";
    renderReviewSchedule(null);
    renderTiers(null);
    return;
  }

  const retentionPercent = Number(formatPercent(memory.effectiveRetention));
  elements.memoryHeading.textContent = memory.content;
  elements.memoryId.textContent = `Memory ID ${memory.id}`;
  elements.memoryTierBadge.dataset.tier = memory.memoryType;
  elements.memoryTierBadge.textContent =
    memory.memoryTypeLabel || tierLabels[memory.memoryType] || memory.memoryType;
  elements.retentionValue.textContent = retentionPercent.toFixed(1);
  elements.retentionContext.textContent = retentionContextForPhase(phase);
  elements.retentionTrack.querySelector("i").style.width =
    `${Math.max(0, Math.min(100, retentionPercent))}%`;
  elements.retentionTrack.setAttribute(
    "aria-valuenow",
    retentionPercent.toFixed(1),
  );
  elements.accessCount.textContent = String(memory.accessCount);
  elements.reviewCount.textContent = String(memory.reviewCount);
  elements.memoryAge.textContent = formatAge(memory.ageHours);
  renderReviewSchedule(memory);
  renderTiers(memory);
}

function renderTiers(memory) {
  const currentIndex = memory
    ? Math.max(0, tierOrder.indexOf(memory.memoryType))
    : -1;

  elements.tierStages.forEach((stage, index) => {
    stage.dataset.state =
      currentIndex < 0
        ? "upcoming"
        : index < currentIndex
          ? "past"
          : index === currentIndex
            ? "active"
            : "upcoming";

    const tier = app.state?.tiers?.find(
      (item) => item.id === stage.dataset.tier,
    );
    const strength = stage.querySelector("small");
    if (tier && strength) {
      strength.textContent =
        `衰减时间尺度 ${Number(tier.decayRate)} 天`;
    }
  });

  elements.tierArrows.forEach((arrow, index) => {
    arrow.dataset.state = currentIndex > index ? "passed" : "waiting";
  });
}

function setPrimaryControl(target) {
  elements.resetButton.classList.remove("primary", "secondary");
  elements.resetButton.classList.add("quiet");
  [elements.addButton, elements.ageButton, elements.searchButton].forEach(
    (button) => {
      button.classList.remove("primary", "quiet");
      button.classList.add("secondary");
    },
  );

  if (!target) return;
  target.classList.remove("quiet", "secondary");
  target.classList.add("primary");
}

function renderControls() {
  if (app.busy) return;
  const phase = derivePhase();
  const ready = Boolean(app.state?.ready && app.state?.memory);
  const ageEnabled = ["fresh", "long"].includes(phase);
  const searchEnabled = [
    "decayed",
    "reinforced",
    "verified",
    "threshold",
    "short",
    "long-aged",
  ].includes(phase);

  elements.addForm.hidden = ready;
  elements.resetButton.disabled = !ready;
  elements.addButton.disabled = ready;
  elements.ageButton.disabled = !ageEnabled;
  elements.searchButton.disabled = !searchEnabled;
  elements.queryInput.disabled = !searchEnabled;
  elements.resetLabel.textContent = "重新开始";

  if (phase === "reset") {
    setPrimaryControl(elements.addButton);
  } else if (ageEnabled) {
    setPrimaryControl(elements.ageButton);
  } else if (searchEnabled) {
    setPrimaryControl(elements.searchButton);
  } else {
    setPrimaryControl(null);
  }

  setButtonText(
    elements.ageButton,
    phase === "long" ? "长期记忆再经过 24 小时" : "模拟经过 24 小时",
  );

  const searchLabels = {
    decayed: "提出问题",
    reinforced: "再次提问",
    verified: "第三次提问",
    threshold: "继续提问并晋升",
    short: "再次提问进入长期记忆",
    "long-aged": "再次提问验证",
  };
  setButtonText(elements.searchButton, searchLabels[phase] || "提出问题");

  const badgeCopy = {
    reset: "等待写入",
    fresh: "第 2 步 / 5",
    decayed: "第 3 步 / 5",
    reinforced: "强化已发生",
    verified: "访问 2 / 5",
    threshold: "阈值已满足",
    short: "短期记忆",
    long: "长期记忆",
    "long-aged": "最终验证",
    done: "实验完成",
  };
  elements.stepBadge.textContent = badgeCopy[phase];
}

function setNextAction(state, text) {
  elements.nextAction.dataset.state = state;
  elements.nextAction.querySelector("strong").textContent = text;
}

function renderGuidance() {
  const phase = derivePhase();
  const guidance = {
    reset: [
      "reset",
      "点击“写入这条记忆”；只有写入成功后，生命周期第 1 步才会完成。",
    ],
    fresh: ["decay", "模拟经过 24 小时，观察工作记忆在未访问时自然衰减。"],
    decayed: ["reinforce", "提出问题；本次搜索会使用衰减后的保留率，并在命中后自动强化。"],
    reinforced: ["reinforce", "再次提出相同问题，验证上一次强化已经影响本次检索。"],
    verified: ["promote", "继续提出相同问题；访问次数达到 3 后，下一次命中会触发晋升。"],
    threshold: ["promote", "再次提问，PowerMem 将按访问前计数把工作记忆晋升为短期记忆。"],
    short: ["promote", "再提问一次；相同晋升条件仍成立，短期记忆将进入长期记忆。"],
    long: ["verify", "让长期记忆再经过 24 小时，验证层级变化确实减慢了衰减。"],
    "long-aged": [
      "verify",
      "最后再提问一次，观察长期记忆的慢衰减和访问强化。",
    ],
    done: ["done", "实验完成：同一条记忆经历了衰减、强化、晋升与长期保持。"],
  };
  setNextAction(...guidance[phase]);
}

function renderFeedback() {
  const observation = app.observation;
  if (!observation?.search?.result) {
    elements.feedbackEmpty.hidden = false;
    elements.feedbackContent.hidden = true;
    elements.searchDuration.textContent = "尚未提问";
    return;
  }

  const { search, change, semanticStatus } = observation;
  const result = search.result;
  const before = change.before;
  const after = change.after;

  elements.feedbackEmpty.hidden = true;
  elements.feedbackContent.hidden = false;
  elements.searchDuration.textContent = `${search.durationMs} ms`;
  elements.semanticStatus.textContent = semanticStatus;
  elements.searchRetention.textContent =
    `${formatPercent(result.effectiveRetention)}%`;

  if (search.promotedFrom && search.promotedTo) {
    elements.feedbackOutcome.textContent =
      `${tierLabels[search.promotedFrom]} → ${tierLabels[search.promotedTo]}`;
    elements.feedbackOutcomeDetail.textContent =
      `访问次数 ${before.accessCount} → ${after.accessCount}`;
  } else if (search.reinforcementApplied) {
    elements.feedbackOutcome.textContent = "访问强化";
    elements.feedbackOutcomeDetail.textContent =
      `保留率 ${formatPercent(result.effectiveRetention)}% → ` +
      `${formatPercent(after.storedRetention)}%`;
  } else if (
    after.memoryType === "working" &&
    after.accessCount === app.state.promotionThreshold
  ) {
    elements.feedbackOutcome.textContent = "达到晋升阈值";
    elements.feedbackOutcomeDetail.textContent =
      `访问次数 ${before.accessCount} → ${after.accessCount}`;
  } else {
    elements.feedbackOutcome.textContent =
      `访问次数 ${before.accessCount} → ${after.accessCount}`;
    elements.feedbackOutcomeDetail.textContent =
      `当前仍为 ${after.memoryTypeLabel}`;
  }

}

function describeNextReview(review) {
  if (!review?.at || review.status === "none") {
    return "next_review = null";
  }
  const deltaSeconds =
    (new Date(review.at).getTime() - Date.now()) / 1000;
  if (review.status === "due" || deltaSeconds <= 0) {
    return `next_review 条件已满足（${formatDateTime(review.at)}）`;
  }
  return (
    `next_review ${formatDateTime(review.at)}` +
    `（还有 ${formatDuration(deltaSeconds)}）`
  );
}

function buildEventCalculation(event) {
  const data = event.data;
  if (!data?.operation) return null;

  if (data.operation === "initial_retention") {
    const calculation = data.calculation;
    const operands = calculation?.operands;
    if (!calculation || !operands) return null;
    return {
      label: "初始保留率计算",
      formula:
        `initial_retention = max(` +
        `${formatDecimal(operands.max_retention, 3)} × ` +
        `${formatDecimal(operands.importance_score, 3)}, ` +
        `${formatDecimal(operands.retention_floor, 3)}) = ` +
        `${formatDecimal(calculation.observed_result, 4)}`,
      parameters: [
        {
          value:
            `max_retention = ` +
            `${formatDecimal(operands.max_retention, 3)}`,
          meaning: "initial_retention 配置经 0–1 限幅后的最大值",
        },
        {
          value:
            `importance_score = ` +
            `${formatDecimal(operands.importance_score, 3)}`,
          meaning: "这条记忆的重要性评分",
        },
        {
          value:
            `retention_floor = ` +
            `${formatDecimal(operands.retention_floor, 3)}`,
          meaning: "由 working_threshold 限幅得到的保留率下限",
        },
        {
          value:
            `initial_retention = ` +
            `${formatDecimal(calculation.observed_result, 4)}`,
          meaning: "创建时写入的初始保留率快照",
        },
      ],
      result:
        `importance_score ` +
        `${formatDecimal(operands.importance_score, 3)} → ` +
        `初始保留率 ${formatPercent(calculation.observed_result)}%`,
      note:
        "写入时同时建立 initial_retention 与 current_retention 快照。",
    };
  }

  if (data.operation === "time_decay") {
    const calculation = data.calculation;
    const operands = calculation?.operands;
    const snapshot = data.currentRetentionSnapshot;
    if (!calculation || !operands || !snapshot) return null;
    return {
      label: "时间衰减计算",
      formula:
        `R(t) = R₀ × exp(−t / S) = ` +
        `${formatDecimal(operands.current_retention)} × ` +
        `exp(−${formatDecimal(operands.t_days, 2)} / ` +
        `${formatDecimal(operands.s_days, 2)}) ≈ ` +
        `${formatDecimal(calculation.calculated_result)}`,
      parameters: [
        {
          value:
            `R₀ = current_retention = ` +
            `${formatDecimal(operands.current_retention)}`,
          meaning: "last_reviewed 时持久化的保留率快照",
        },
        {
          value:
            `t = hours_elapsed / 24 = ` +
            `${formatDecimal(operands.t_days, 2)} 天`,
          meaning: "把源码的小时差换算成天",
        },
        {
          value:
            `S = decay_rate = ` +
            `${formatDecimal(operands.s_days, 3)} 天`,
          meaning: "源码有效强度参数对应的衰减时间尺度",
        },
        {
          value:
            `hours_elapsed = ` +
            `${formatDecimal(operands.hours_elapsed, 2)}h`,
          meaning: "calculate_decay() 实际读取的时间差",
        },
        {
          value:
            `decay_factor = ` +
            `${formatDecimal(calculation.decay_factor)}`,
          meaning: "calculate_decay() 根据时间与 decay_rate 算出的比例",
        },
        {
          value:
            `effective_retention = ` +
            `${formatDecimal(calculation.observed_result)}`,
          meaning: "用于展示与检索排序的实时保留率",
        },
      ],
      result:
        `记忆保留率 ${formatPercent(operands.current_retention)}% → ` +
        `${formatPercent(calculation.observed_result)}%`,
      note:
        `current_retention 快照保持 ` +
        `${formatDecimal(snapshot.after)}；` +
        `${describeNextReview(data.nextReview?.after)}。`,
    };
  }

  if (data.operation === "review_reinforcement") {
    const calculation = data.calculation;
    const operands = calculation?.operands;
    const reviewCount = data.reviewCount;
    const snapshot = data.currentRetentionSnapshot;
    if (!calculation || !operands || !reviewCount || !snapshot) return null;
    return {
      label: "访问强化计算",
      formula:
        `new_retention = min(1.0, ` +
        `${formatDecimal(operands.current_retention)} + ` +
        `${formatDecimal(operands.reinforcement_factor, 3)} × ` +
        `(1.0 − ${formatDecimal(operands.current_retention)})) ≈ ` +
        `${formatDecimal(calculation.persisted_result)}`,
      parameters: [
        {
          value:
            `current_retention = ` +
            `${formatDecimal(operands.current_retention)}`,
          meaning: "reinforce() 动态计算得到的强化前保留率",
        },
        {
          value:
            `reinforcement_factor = ` +
            `${formatDecimal(operands.reinforcement_factor, 3)}`,
          meaning:
            `访问强化系数；补回遗忘缺口的 ` +
            `${formatPercent(operands.reinforcement_factor)}%`,
        },
        {
          value: "1.0",
          meaning: "源码中的保留率上限常量，不是独立参数",
        },
        {
          value:
            `new_retention = ` +
            `${formatDecimal(calculation.persisted_result)}`,
          meaning: "强化后写入 current_retention 的新快照",
        },
      ],
      result:
        `记忆保留率 ${formatPercent(operands.current_retention)}% → ` +
        `${formatPercent(calculation.persisted_result)}% · ` +
        `review_count ${reviewCount.before} → ${reviewCount.after}`,
      note:
        `current_retention 新快照 ` +
        `${formatDecimal(snapshot.after)}；` +
        `${describeNextReview(data.nextReview?.after)}。`,
    };
  }

  if (
    data.operation === "search_access" &&
    !data.reinforcementApplied &&
    data.effectiveTimeScale
  ) {
    const before = data.effectiveTimeScale.before;
    const after = data.effectiveTimeScale.after;
    const operands = after?.operands;
    const accessCount = data.accessCount;
    const snapshot = data.currentRetentionSnapshot;
    const reviewCount = data.reviewCount;
    if (
      !before ||
      !after ||
      !operands ||
      !accessCount ||
      !snapshot ||
      !reviewCount
    ) {
      return null;
    }
    const reasonMessage = (
      data.reason?.message || "本次未执行保留率强化"
    ).replace(/。$/u, "");
    return {
      label: "访问对后续衰减的影响",
      formula:
        `decay_rate = ${formatDecimal(operands.base_rate, 3)} × ` +
        `[1 + ` +
        `${formatDecimal(operands.reinforcement_factor, 3)} × ` +
        `log1p(${operands.access_count})] = ` +
        `${formatDecimal(after.decay_rate, 3)} 天`,
      parameters: [
        {
          value:
            `base_rate = ` +
            `${formatDecimal(operands.base_rate, 3)} 天`,
          meaning: "当前 memory_type 对应的基础衰减强度",
        },
        {
          value:
            `reinforcement_factor = ` +
            `${formatDecimal(operands.reinforcement_factor, 3)}`,
          meaning: "访问强化系数",
        },
        {
          value: `access_count = ${operands.access_count}`,
          meaning: "本次访问后的累计访问次数",
        },
        {
          value:
            `decay_rate = ` +
            `${formatDecimal(after.decay_rate, 3)} 天`,
          meaning: "_resolve_decay_rate() 返回的有效衰减强度",
        },
      ],
      result:
        `access_count ${accessCount.before} → ${accessCount.after} · ` +
        `后续 decay_rate ` +
        `${formatDecimal(before.decay_rate, 3)} → ` +
        `${formatDecimal(after.decay_rate, 3)} 天`,
      note:
        `${reasonMessage}；current_retention 保持 ` +
        `${formatDecimal(snapshot.after)}，` +
        `review_count 保持 ${reviewCount.after}；` +
        `${describeNextReview(data.nextReview?.after)}。`,
    };
  }

  return null;
}

function renderEventCalculation(item, event) {
  const view = buildEventCalculation(event);
  const container = item.querySelector(".event-calculation");
  if (!view) {
    container.remove();
    return;
  }

  container.hidden = false;
  container.querySelector(".calculation-label").textContent = view.label;
  container.querySelector(".calculation-formula").textContent = view.formula;
  const parameters = container.querySelector(".calculation-parameters");
  view.parameters.forEach((parameter) => {
    const row = document.createElement("div");
    const term = document.createElement("dt");
    const value = document.createElement("code");
    const meaning = document.createElement("dd");
    value.textContent = parameter.value;
    meaning.textContent = parameter.meaning;
    term.append(value);
    row.append(term, meaning);
    parameters.append(row);
  });
  container.querySelector(".calculation-result").textContent = view.result;
  container.querySelector(".calculation-note").textContent = view.note;
}

function appendEvents(events) {
  events.forEach((event) => {
    app.eventCount += 1;
    const item = templates.event.content.firstElementChild.cloneNode(true);
    item.dataset.kind = event.kind;
    item.querySelector(".event-index").textContent =
      String(app.eventCount).padStart(2, "0");
    item.querySelector(".event-title").textContent = event.title;
    item.querySelector(".event-time").textContent = formatTime(event.timestamp);
    item.querySelector(".event-detail").textContent = event.detail;
    renderEventCalculation(item, event);

    const requestElement = item.querySelector(".event-request");
    if (
      event.method ||
      event.target ||
      (event.durationMs !== null && event.durationMs !== undefined)
    ) {
      const method = requestElement.querySelector(".request-method");
      if (event.method) {
        method.textContent = event.method;
      } else {
        method.remove();
      }
      requestElement.querySelector(".request-target").textContent =
        event.target || "";
      requestElement.querySelector(".request-duration").textContent =
        event.durationMs === null || event.durationMs === undefined
          ? ""
          : `${event.status} · ${event.durationMs} ms`;
    } else {
      requestElement.remove();
    }
    elements.eventLog.append(item);
  });
  elements.eventLog.scrollTop = elements.eventLog.scrollHeight;
}

function render() {
  renderJourney();
  renderMemory();
  renderControls();
  renderGuidance();
  renderFeedback();
}

async function loadStatus() {
  try {
    app.state = await request("/api/status");
    if (app.state.defaultQuery) {
      elements.queryInput.value = app.state.defaultQuery;
    }
    setConnection("ready", "PowerMem 已连接");
    render();
  } catch (error) {
    setConnection("error", "连接失败");
    showToast(error.message, "error");
  }
}

elements.addForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setBusy(true, elements.addButton, "正在写入…");
  try {
    const data = await request("/api/add", { method: "POST", body: {} });
    if (!data.state?.ready || !data.state?.memory) {
      throw new Error("PowerMem 未返回已写入的记忆状态，请重试。");
    }
    app.state = data.state;
    app.observation = null;
    app.baselineScore = null;
    appendEvents(data.events);
    showToast("记忆已写入 PowerMem，生命周期第 1 步已完成。");
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    setBusy(false, elements.addButton);
    render();
  }
});

elements.resetButton.addEventListener("click", async () => {
  setBusy(true, elements.resetButton, "正在清空…");
  try {
    const data = await request("/api/reset", { method: "POST", body: {} });
    app.state = data.state;
    app.observation = null;
    app.baselineScore = null;
    if (data.eventLogCleared) {
      elements.eventLog.replaceChildren();
      app.eventCount = 0;
    }
    appendEvents(data.events);
    showToast("实验已清空，可以重新写入这条记忆。");
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    setBusy(false, elements.resetButton);
    render();
  }
});

elements.ageForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setBusy(true, elements.ageButton, "正在模拟…");
  try {
    const data = await request("/api/age", {
      method: "POST",
      body: { hours: 24 },
    });
    app.state = data.state;
    app.observation = null;
    appendEvents(data.events);
    showToast("已模拟经过 24 小时，记忆状态已重新计算。");
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    setBusy(false, elements.ageButton);
    render();
  }
});

elements.searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setBusy(true, elements.searchButton, "正在检索…");
  try {
    const data = await request("/api/search", {
      method: "POST",
      body: { query: elements.queryInput.value },
    });
    const result = data.search?.result;
    let semanticStatus = "未返回记忆";
    if (result) {
      if (app.baselineScore === null) {
        semanticStatus = "基准已记录";
        app.baselineScore = result.originalScore;
      } else {
        const delta = Math.abs(result.originalScore - app.baselineScore);
        semanticStatus = delta < 1e-9 ? "保持不变" : "随问题变化";
      }
    }
    app.state = data.state;
    app.observation = { ...data, semanticStatus };
    appendEvents(data.events);
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    setBusy(false, elements.searchButton);
    render();
  }
});

elements.clearLog.addEventListener("click", () => {
  elements.eventLog.replaceChildren();
  app.eventCount = 0;
  const item = document.createElement("li");
  item.className = "event welcome";
  item.innerHTML = `
    <span class="event-index">—</span>
    <div><strong>日志已清空</strong><p>新的真实操作会继续记录在这里。</p></div>`;
  elements.eventLog.append(item);
});

loadStatus();
window.setInterval(
  () => renderReviewSchedule(app.state?.memory || null),
  30_000,
);
