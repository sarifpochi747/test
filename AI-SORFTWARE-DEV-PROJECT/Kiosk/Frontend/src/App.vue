<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import TrackList from "./components/TrackList/TrackList.vue";
import axios from "axios";
const days = ["MON", "TUE", "WED", "THU", "FLY", "SAT"];

let timeStr = ref("");
let dayStr = ref("");

// const displayRatio = import.meta.env.VITE_DISPLAY_RATIO;
const tracking = reactive<TrackList.trackingObj[]>(
  [] as TrackList.trackingObj[]
);

const video_feed_url = "http://localhost:3001/video_feed";
onMounted(() => {
  setInterval(async () => {
    const d = new Date();
    timeStr.value =
      d.getHours().toString().padStart(2, "0") +
      ":" +
      d.getMinutes().toString().padStart(2, "0");
    dayStr.value = days[d.getDay() - 1];
    try {
      const detection = await axios.get(
        import.meta.env.VITE_BASE_URL + "/pred"
      );
      for (const face of detection.data) {
        const detect = JSON.parse(face);
        if (tracking.length > 2) {
          tracking.pop();
        }
        tracking.unshift(detect["detection"]);
      }
    } catch {}
  }, 1000);
});
</script>

<template>
  <div class="mainWindow">
    <div class="top-bar">
      <div class="time">
        {{ timeStr }}
      </div>
      <div class="day">
        {{ dayStr }}
      </div>
    </div>

    <div class="cameraContainer">
      <img
        :src="video_feed_url"
        alt=""
        style="height: 100%; width: auto"
        id="imageShow"
      />
    </div>
    <div class="tracking-list-container">
      <div
        class="teracking-wrap"
        v-for="(item, index) in tracking"
        :key="index"
      >
        <TrackList :data="item" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.mainWindow {
  height: 100dvh;
  overflow: hidden;
  background: var(--background-color);
  margin: 0 auto;
  position: relative;
}

.top-bar {
  position: absolute;
  top: 2%;
  left: 3%;
  display: flex;
  align-items: center;
  background-color: rgba(151, 151, 151, 0.719);
  border-radius: 2rem;
}

.time {
  z-index: 100;
  font-size: 1.3rem;
  color: rgba(151, 151, 151, 0.719);
  background-color: white;
  opacity: 0.8;
  padding: 0rem 0.6rem;
  border-radius: 2rem;
}

.day {
  left: 3%;
  z-index: 100;
  font-size: 1.3rem;
  color: white;
  /* background-color: white; */
  opacity: 0.7;
  padding: 0.25rem 0.8rem;
  border-radius: 2rem;
}

.cameraContainer {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  border-radius: 0.5rem;
  border: 1px solid black;
  margin: 0 auto;
  margin-top: 0.5rem;
  background: white;
  overflow: hidden;
  position: absolute;
}

.tracking-list-container {
  height: 25dvh;
  width: 90%;
  bottom: 0;
  left: 50%;
  overflow: hidden;
  position: absolute;
  min-height: 3.5rem;
  transform: translate(-50%, 0%);
}

.tracking-list-container::-webkit-scrollbar {
  display: none;
}

.teracking-wrap {
  width: 95%;
  margin: 0 auto;
  max-width: 600px;
  transition: all 0.5s;
}

/* .teracking-wrap:nth-child(even) {
  background-color: var(--tracking-even-background-color);
  color: var(--tracking-even-text-color)
}

.teracking-wrap:nth-child(odd) {
  background-color: var(--tracking-odd-background-color);
  color: var(--tracking-odd-text-color)
} */
</style>
