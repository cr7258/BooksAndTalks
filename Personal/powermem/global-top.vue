<template>
  <div class="deck-brand-strip" aria-label="OceanBase、Red Hat 和 Dify">
    <img
      class="deck-brand-logo deck-brand-logo-oceanbase"
      src="./assets/brand/oceanbase.png"
      alt="OceanBase"
    />
    <img
      class="deck-brand-logo deck-brand-logo-redhat"
      src="./assets/brand/red-hat.png"
      alt="Red Hat"
    />
    <img
      class="deck-brand-logo deck-brand-logo-dify"
      src="./assets/brand/dify.png"
      alt="Dify"
    />
  </div>
</template>

<style scoped>
.deck-brand-strip {
  position: absolute;
  z-index: 70;
  top: 12px;
  right: 28px;
  display: flex;
  height: 18px;
  align-items: center;
  gap: 10px;
  pointer-events: none;
  user-select: none;
}

.deck-brand-logo {
  display: block;
  flex: none;
  object-fit: contain;
  filter: drop-shadow(0 1px 3px rgb(0 0 0 / 45%));
}

.deck-brand-logo-oceanbase {
  width: 96px;
  height: 16px;
}

.deck-brand-logo-redhat {
  width: 68px;
  height: 16px;
}

.deck-brand-logo-dify {
  width: 42px;
  height: 18px;
}
</style>
