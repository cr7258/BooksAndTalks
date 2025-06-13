// clang verifier.c -o verifier -static

#include <stdio.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <syscall.h>
#include <linux/bpf.h>
#include <sys/socket.h>
#include <unistd.h>
#include <sys/user.h>
//#include <bpf/bpf.h>
#include <bcc/libbpf.h>

int socks[2] = {-1};

int bpf(int cmd, union bpf_attr *attr){
    return syscall(__NR_bpf, cmd, attr, sizeof(*attr));
}

int bpf_prog_load(union bpf_attr *attr){
    return bpf(BPF_PROG_LOAD, attr);
}

union bpf_attr* create_bpf_prog(struct bpf_insn *insns, unsigned int insn_cnt){
    union bpf_attr *attr = (union bpf_attr *) malloc(sizeof(union bpf_attr));

    attr->prog_type = BPF_PROG_TYPE_SOCKET_FILTER;
    attr->insn_cnt = insn_cnt;
    attr->insns = (uint64_t) insns;
    attr->license = (uint64_t)"";

    return attr;
}

int attach_socket(int prog_fd){
    if(socks[0] == -1 && socketpair(AF_UNIX, SOCK_DGRAM, 0, socks) < 0){
        perror("socketpair");
        exit(1);
    }

    if(setsockopt(socks[0], SOL_SOCKET, SO_ATTACH_BPF, &prog_fd, sizeof(prog_fd)) < 0){
        perror("setsockopt");
        exit(1);
    }
    return 0;
}

void setup_bpf_prog(struct bpf_insn *insns, uint insncnt){
    char log_buffer[0x1000];

    union bpf_attr *prog = create_bpf_prog(insns, insncnt);

    prog->log_level = 2;
    prog->log_buf = (uint64_t) log_buffer;
    prog->log_size = sizeof(log_buffer);
    strncpy(prog->prog_name, "stdnoerr", 16);

    int prog_fd = bpf_prog_load(prog);
    printf("%ld\n", strlen(log_buffer));
    puts(log_buffer);

    if(prog_fd < 0){
        perror("prog_load");
        exit(1);
    }

    attach_socket(prog_fd);
}

void run_bpf_prog(struct bpf_insn *insns, uint insncnt){
    int val = 0;

    setup_bpf_prog(insns, insncnt);
    write(socks[1], &val, sizeof(val));
}

static __always_inline int
bpf_syscall(int cmd, union bpf_attr *attr, unsigned int size)
{
    return syscall(__NR_bpf, cmd, attr, size);
}

static __always_inline int
bpf_create_map(enum bpf_map_type map_type, unsigned int key_size,
                unsigned int value_size, unsigned int max_entries)
{
    union bpf_attr attr =
    {
        .map_type = map_type,
        .key_size = key_size,
        .value_size = value_size,
        .max_entries = max_entries,
    };

    return bpf_syscall(BPF_MAP_CREATE, &attr, sizeof(attr));
}

int main(){
    struct bpf_insn insns[] = {
        BPF_MOV64_IMM(BPF_REG_1, 0xa21),	/* '!\n' */
		BPF_STX_MEM(BPF_H, BPF_REG_10, BPF_REG_1, -4),
		BPF_MOV64_IMM(BPF_REG_1, 0x646c726f),	/* 'orld' */
		BPF_STX_MEM(BPF_W, BPF_REG_10, BPF_REG_1, -8),
		BPF_MOV64_IMM(BPF_REG_1, 0x57202c6f),	/* 'o, W' */
		BPF_STX_MEM(BPF_W, BPF_REG_10, BPF_REG_1, -12),
		BPF_MOV64_IMM(BPF_REG_1, 0x6c6c6548),	/* 'Hell' */
		BPF_STX_MEM(BPF_W, BPF_REG_10, BPF_REG_1, -16),
		BPF_MOV64_IMM(BPF_REG_1, 0),
		BPF_STX_MEM(BPF_B, BPF_REG_10, BPF_REG_1, -2),
		BPF_MOV64_REG(BPF_REG_1, BPF_REG_10),
		BPF_ALU64_IMM(BPF_ADD, BPF_REG_1, -16),
		BPF_MOV64_IMM(BPF_REG_2, 15),
		BPF_RAW_INSN(BPF_JMP | BPF_CALL, 0, 0, 0,
			     BPF_FUNC_trace_printk),
		BPF_MOV64_IMM(BPF_REG_0, 0),
		BPF_EXIT_INSN(),
    };

    // 寄存器从来没有被写过，它是不可读的
    struct bpf_insn insns2[] = {
		BPF_MOV64_REG(BPF_REG_0, BPF_REG_2),
		BPF_EXIT_INSN(),
    };

    // 程序在访问map element前没检查map_lookup_elem()的返回值
    struct bpf_insn insns3[] = {
		BPF_ST_MEM(BPF_DW, BPF_REG_10, -8, 0),
        BPF_MOV64_REG(BPF_REG_2, BPF_REG_10),
        BPF_ALU64_IMM(BPF_ADD, BPF_REG_2, -8),
        BPF_LD_MAP_FD(BPF_REG_1, 0),
        BPF_RAW_INSN(BPF_JMP | BPF_CALL, 0, 0, 0, BPF_FUNC_map_lookup_elem),
        BPF_ST_MEM(BPF_DW, BPF_REG_0, 0, 0),
        BPF_EXIT_INSN()
    };

    // 程序退出前没有初始化R0
    struct bpf_insn insns4[] = {
		BPF_EXIT_INSN()
    };

    // R10是只读的
    struct bpf_insn insns5[] = {
		BPF_MOV64_REG(BPF_REG_10, BPF_REG_1),
		BPF_EXIT_INSN(),
    };

    // 最后一条指令必须是BPF_EXIT_INSN
    struct bpf_insn insns6[] = {
		BPF_MOV64_IMM(BPF_REG_0, 0),
    };

    int ret = 0;
    ret = bpf_create_map(BPF_MAP_TYPE_ARRAY, sizeof(uint32_t), getpagesize(), 1);
    if (ret < 0) {
        printf("Failed to create comm map: %d (%s)\n", ret, strerror(-ret));
        return ret;
    }
    int comm_fd = ret;
    if ((ret = bpf_create_map(BPF_MAP_TYPE_RINGBUF, 0, 0, getpagesize())) < 0) {
        printf("Could not create ringbuf map: %d (%s)\n", ret, strerror(-ret));
        return ret;
    }
    int ringbuf_fd = ret;
    struct bpf_insn insns7[] = {
        // r9 = r1
        BPF_MOV64_REG(BPF_REG_9, BPF_REG_1),

        // r0 = bpf_lookup_elem(ctx->comm_fd, 0)
        BPF_LD_MAP_FD(BPF_REG_1, comm_fd),
        BPF_ST_MEM(BPF_DW, BPF_REG_10, -8, 0),
        BPF_MOV64_REG(BPF_REG_2, BPF_REG_10),
        BPF_ALU64_IMM(BPF_ADD, BPF_REG_2, -4),
        BPF_RAW_INSN(BPF_JMP | BPF_CALL, 0, 0, 0, BPF_FUNC_map_lookup_elem),

        // if (r0 == NULL) exit(1)
        BPF_JMP_IMM(BPF_JNE, BPF_REG_0, 0, 2),
        BPF_MOV64_IMM(BPF_REG_0, 1),
        BPF_EXIT_INSN(),

        // r8 = r0
        BPF_MOV64_REG(BPF_REG_8, BPF_REG_0),

        // r0 = bpf_ringbuf_reserve(ctx->ringbuf_fd, PAGE_SIZE, 0)
        BPF_LD_MAP_FD(BPF_REG_1, ringbuf_fd),
        BPF_MOV64_IMM(BPF_REG_2, PAGE_SIZE),
        BPF_MOV64_IMM(BPF_REG_3, 0x00),
        BPF_RAW_INSN(BPF_JMP | BPF_CALL, 0, 0, 0, BPF_FUNC_ringbuf_reserve),

        BPF_MOV64_REG(BPF_REG_1, BPF_REG_0),
        BPF_ALU64_IMM(BPF_ADD, BPF_REG_1, 1), // 这里提示算术出错了

        // if (r0 != NULL) { ringbuf_discard(r0, 1); exit(2); }
        BPF_JMP_IMM(BPF_JEQ, BPF_REG_0, 0, 5),
        BPF_MOV64_REG(BPF_REG_1, BPF_REG_0),
        BPF_MOV64_IMM(BPF_REG_2, 1),
        BPF_RAW_INSN(BPF_JMP | BPF_CALL, 0, 0, 0, BPF_FUNC_ringbuf_discard),
        BPF_MOV64_IMM(BPF_REG_0, 2),

        BPF_EXIT_INSN(),

        // verifier believe r0 = 0 and r1 = 0. However, r0 = 0 and  r1 = 1 on runtime.

        // r7 = r1 + 8
        BPF_MOV64_REG(BPF_REG_7, BPF_REG_1),
        BPF_ALU64_IMM(BPF_ADD, BPF_REG_7, 8),

        BPF_EXIT_INSN(),
    };

    // run_bpf_prog(insns, sizeof(insns)/sizeof(insns[0]));
    // run_bpf_prog(insns2, sizeof(insns2)/sizeof(insns2[0]));
    // run_bpf_prog(insns3, sizeof(insns2)/sizeof(insns3[0]));
    // run_bpf_prog(insns4, sizeof(insns2)/sizeof(insns4[0]));
    // run_bpf_prog(insns5, sizeof(insns2)/sizeof(insns5[0]));
    run_bpf_prog(insns6, sizeof(insns2)/sizeof(insns6[0]));
    // run_bpf_prog(insns7, sizeof(insns7)/sizeof(insns7[0]));
}
