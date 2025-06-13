#include <stdio.h>
#include <unistd.h>
#include <sys/sdt.h>

int add(int a, int b) {
   int ret = a + b;
   DTRACE_PROBE3(test, add, a, b, ret);
   return ret;
}

int main() {
    while (1) {
        DTRACE_PROBE(test, loop_start);
        add(5, 3);
        printf("Hello, USDT!\n");
        sleep(1);
        DTRACE_PROBE(test, loop_end);
    }
    return 0;
}
