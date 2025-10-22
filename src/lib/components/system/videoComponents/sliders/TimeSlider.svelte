<media-time-slider class="vds-time-slider vds-slider">
  <media-slider-chapters class="vds-slider-chapters">
    <template>
      <div class="vds-slider-chapter">
        <div class="vds-slider-track"></div>
        <div class="vds-slider-track-fill vds-slider-track"></div>
        <div class="vds-slider-progress vds-slider-track"></div>
      </div>
    </template>
  </media-slider-chapters>
</media-time-slider>

<style lang="scss">
  .vds-slider {
    margin: 0;
    grid-area: time;
  }

  @media screen and (max-width: 600px) {
    .vds-slider {
      display: none;
    }
  }
</style>
