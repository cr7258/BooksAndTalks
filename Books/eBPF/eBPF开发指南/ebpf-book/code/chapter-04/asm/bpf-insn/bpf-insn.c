// clang bpf-insn.c -o bpf-insn -lbcc -lbpf

#include <errno.h>
#include <fcntl.h>
#include <limits.h>
#include <linux/bpf.h>
#include <linux/perf_event.h>
#include <linux/version.h>
#include <signal.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/ioctl.h>
#include <sys/syscall.h>
#include <unistd.h>
#include <bpf/bpf.h>
#include <bcc/libbpf.h>

char bpf_log_buf[BPF_LOG_BUF_SIZE];

int wait_for_sig_int()
{
    sigset_t set;
    sigemptyset(&set);
    int rc = sigaddset(&set, SIGINT);
    if (rc < 0)
    {
        perror("Error calling sigaddset()");
        return 1;
    }

    rc = sigprocmask(SIG_BLOCK, &set, NULL);
    if (rc < 0)
    {
        perror("Error calling sigprocmask()");
        return 1;
    }

    int sig;
    rc = sigwait(&set, &sig);
    if (rc < 0)
    {
        perror("Error calling sigwait()");
        return 1;
    }
    else if (sig == SIGINT)
    {
        fprintf(stderr, "SIGINT received!\n");
        return 0;
    }
    else
    {
        fprintf(stderr, "Unexpected signal received: %d\n", sig);
        return 0;
    }
}

int main(int argc, char **argv)
{
    unsigned char prog[] = {
        0xB7, 0x01, 0x00, 0x00, 0x21, 0x0A, 0x00, 0x00, 0x6B, 0x1A, 0xFC, 0xFF, 0x00, 0x00, 0x00, 0x00,
        0xB7, 0x01, 0x00, 0x00, 0x6F, 0x72, 0x6C, 0x64, 0x63, 0x1A, 0xF8, 0xFF, 0x00, 0x00, 0x00, 0x00,
        0x18, 0x01, 0x00, 0x00, 0x48, 0x65, 0x6C, 0x6C, 0x00, 0x00, 0x00, 0x00, 0x6F, 0x2C, 0x20, 0x57,
        0x7B, 0x1A, 0xF0, 0xFF, 0x00, 0x00, 0x00, 0x00, 0xB7, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x73, 0x1A, 0xFE, 0xFF, 0x00, 0x00, 0x00, 0x00, 0xBF, 0xA1, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x07, 0x01, 0x00, 0x00, 0xF0, 0xFF, 0xFF, 0xFF, 0xB7, 0x02, 0x00, 0x00, 0x0F, 0x00, 0x00, 0x00,
        0x85, 0x00, 0x00, 0x00, 0x06, 0x00, 0x00, 0x00, 0xB7, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x95, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
    };

    int insn_cnt = sizeof(prog) / sizeof(struct bpf_insn);
    printf("insn_cnt: %d\n", insn_cnt);
    int prog_fd = bpf_load_program(BPF_PROG_TYPE_KPROBE,
                                   (const struct bpf_insn *)&prog,
                                   insn_cnt,
                                   "GPL",
                                   LINUX_VERSION_CODE,
                                   bpf_log_buf, BPF_LOG_BUF_SIZE);
    if (prog_fd < 0)
    {
        printf("ERROR: failed to load prog '%s'\n", strerror(errno));
        return 1;
    }

    int perf_event_fd = bpf_attach_kprobe(prog_fd, BPF_PROBE_ENTRY, "kprobe__hello", "do_unlinkat", 0, 0);
    if (perf_event_fd < 0)
    {
        perror("Error calling attach_kprobe()");
        close(prog_fd);
        return 1;
    }

    system("cat /sys/kernel/debug/tracing/trace_pipe");
    int exit_code = wait_for_sig_int();
    close(perf_event_fd);
    close(prog_fd);
    bpf_detach_kprobe("kprobe__hello");

    return exit_code;
}
