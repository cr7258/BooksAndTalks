

#### bpftrace版hello

```bash
$ sudo bpftrace -e 'BEGIN { printf("hello world\n"); }'
```


#### 使用bpftrace单行程序跟踪系统调用（syscall）的次数
```bash
# 跟踪程序系统调用（syscall）的次数
$ sudo bpftrace -e 'tracepoint:raw_syscalls:sys_enter { @[comm] = count(); }'
```