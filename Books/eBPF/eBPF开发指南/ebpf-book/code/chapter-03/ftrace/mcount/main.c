// gcc -c main.c -pg
// gcc mcount.o main.o -o test
// ./test
#include <stdlib.h>
#include <stdio.h>

extern void mcount(void);

int add(int a, int b) {
    int c = a + b;
    printf("add:%d\n", c);
    return c;
}

int main() {
    int c = add(5, 6);
    printf("main:%d\n", c);
    return c;
}

