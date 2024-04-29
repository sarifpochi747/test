<script setup lang="ts">
import { onMounted } from "vue";
// import { ref } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faFaceAngry,
  faFaceGrimace,
  faFaceGrinBeamSweat,
  faFaceLaughSquint,
  faFaceSadCry,
  faFaceGrinStars,
  faFaceMeh,
} from "@fortawesome/free-regular-svg-icons";

library.add(
  faFaceAngry,
  faFaceGrimace,
  faFaceGrinBeamSweat,
  faFaceLaughSquint,
  faFaceSadCry,
  faFaceGrinStars,
  faFaceMeh
);

const props = defineProps<{ data: TrackList.trackingObj }>();

const Emotions = {
  angry: "fa-regular fa-face-angry",
  disgust: "fa-regular fa-face-grimace",
  fear: "fa-regular fa-face-grin-beam-sweat",
  happy: "fa-regular fa-face-laugh-squint",
  sad: "fa-regular fa-face-sad-cry",
  surprise: "fa-regular fa-face-grin-stars",
  neutral: "fa-regular fa-face-meh",
};
// const containerHeight = ref("-3.5rem");
onMounted(() => {
});
</script>

<template>
  <div
    class="container"
  >
    <div class="img-wrap">
      <img
        :src="'data:image/png;base64,' + props.data.image"
        class="img-obj"
        alt=""
      />
    </div>
    <div class="info-wrap">
      <div class="name info">Name : {{ props.data.name }}</div>
      <div class="age info">Age : {{ props.data.age }}</div>
      <div class="gender info">Gender : {{ props.data.gender }}</div>
    </div>
    <div class="emotion-icon" id="emotion-icon">
      <font-awesome-icon :icon="Emotions[props.data.emotion]" />
    </div>
    <div class="container-bg"></div>
  </div>
</template>
<!-- background-color: var(--tracking-background-color); -->
<style scoped>
.container {
  height: 3.5rem;
  border-radius: 0.3rem;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0.2rem 1.5rem;
  color: var(--tracking-even-text-color);
  margin: 1rem auto;
  position: relative;
  overflow: hidden;
}

.container-bg {
  background-color: var(--tracking-even-background-color);
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  opacity: 0.6;
  border-radius: 2rem;
}

.img-wrap {
  height: 80%;
  width: 20%;
  margin-right: 0.5rem;
  overflow: hidden;
  /* border: 1px solid; */
  border-radius: 10px;
  text-align: center;
}

.img-obj {
  height: 100%;
  border: 1px solid;
}

.info-wrap {
  width: 60%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;

  .name {
    width: 70%;
  }

  .age {
    width: 30%;
  }

  .gender {
    width: 70%;
  }
}

.emotion-icon {
  width: 20%;
  font-size: 3rem;
  aspect-ratio: 1/1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
