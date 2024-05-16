<template>
  <div className="upload-preview flex column gap-16 align-center">
    <!-- <p for="imgUpload">{{ uploadMsg }}</p> -->
    <p>Profile image</p>
    <label v-if="!isUploading && !imgUrl" class="pointer" :class="{ 'drag-zone': isDragover }" @drop.prevent="uploadImg"
      @dragover.prevent="isDragover = true" @dragleave="isDragover = false">
      <uploadIcon />
      <input type="file" @change="uploadImg" accept="image/*" id="imgUpload" hidden />
    </label>
    <img v-if="isUploading && !imgUrl" src="../assets/imgs/loader.gif" alt="" class="loader-gif">

    <div class="flex gap-16 wrap" :style="{ maxWidth: '100%' }">
      <img v-if="imgUrl" :src="imgUrl" :style="{ maxWidth: '95px', maxHeight: '95px', float: 'right' }" />
    </div>
  </div>
</template>

<script>
import { uploadService } from '../services/upload.service.js'
import uploadIcon from '../assets/imgs/upload-icon.vue'

export default {
  props: {
    imgs: Array
  },
  data() {
    return {
      imgUrl: '',
      height: 500,
      width: 500,
      isUploading: false,
      isDragover: false
    }
  },
  created() {
    if (this.imgs?.length) {
      this.imgUrl = this.imgs
    }
  },
  methods: {
    async uploadImg(ev) {
      this.isUploading = true
      const { secure_url, height, width } = await uploadService.uploadImg(ev)
      this.isUploading = false
      this.isDragover = false
      this.imgUrl = secure_url
      this.height = height
      this.width = width
      this.$emit('uploaded', this.imgUrl)
    }
  },
  computed: {
    uploadMsg() {
      if (this.imgUrl.length) return 'Upload Another Image?'
      return this.isUploading ? 'Uploading....' : 'Upload Image'
    }
  },
  components: {
    uploadIcon
  }
}
</script>
