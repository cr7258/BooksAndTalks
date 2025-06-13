#include <stdio.h>
#include <unistd.h>

int a = 1234;

int main() {
    int* p;
    printf("%p\n", &a);

    
    p = (int*)0x555555558010;
    printf("%d\n", *p);

    return 0;
}
