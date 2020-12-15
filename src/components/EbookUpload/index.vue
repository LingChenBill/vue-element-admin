<template>
  <div class="upload-container">
    <el-upload
      :action="action"
      :headers="headers"
      :multiple="false"
      :limit="1"
      :before-upload="beforeUpload"
      :on-success="onSuccess"
      :on-error="onError"
      :on-remove="onRemove"
      :file-list="fileList"
      :on-exceed="onExceed"
      :disabled="disabled"
      drag
      show-file-list
      accept="application/epub+zip"
      class="el-upload"
    >
      <i class="el-icon-upload" />
      <div v-if="fileList.length === 0" class="el-upload__text">
        请将电子书拖入或<em>点击上传</em>
      </div>
      <div v-else class="el-upload__text">图片已上传</div>
    </el-upload>
  </div>
</template>

<script>
import { getToken } from '@/utils/auth'

export default {
  // 从父组件传值.
  props: {
    // 上传的文件列表.
    fileList: {
      type: Array,
      default() {
        return []
      }
    },
    // 是否禁用.
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 上传提交action path.
      action: `${process.env.VUE_APP_BASE_API}/book/upload`
    }
  },
  /**
   * 上传请求头部token设置.
   */
  computed: {
    headers() {
      return {
        Authorization: `Bearer ${getToken()}`
      }
    }
  },
  methods: {
    /**
     * 上传文件之前的钩子.
     */
    beforeUpload(file) {
      // console.log('file', file)
      // 调用父组件的beforeUpload方法.
      this.$emit('beforeUpload', file)
    },
    /**
     * 文件上传成功时的钩子.
     */
    onSuccess(response, file) {
      const { code, msg, data } = response
      if (code === 0) {
        this.$message({
          message: msg,
          type: 'success'
        })
        // 将事件回调给父组件.
        this.$emit('onSuccess', data)
      } else {
        this.$message({
          message: (msg && `上传失败, 失败原因: ${msg}`) || '上传失败',
          type: 'error'
        })
        // 将事件回调给父组件.
        this.$emit('onError', file)
      }
    },
    /**
     * 文件上传失败时的钩子.
     */
    onError(error) {
      // console.log('upload error', { error })
      // 解析上传失败错误信息.
      const errMsg = error.message && JSON.parse(error.message)
      this.$message({
        message: (errMsg && errMsg.msg && `上传失败,失败原因: ${errMsg.msg}`) || '上传失败',
        type: 'error'
      })
      // 将错误信息传给父组件进行处理.
      this.$emit('onError', error)
    },
    /**
     * 文件列表移除文件时的钩子.
     */
    onRemove() {
      this.$message({
        message: '电子书删除成功',
        type: 'success'
      })
      // 调用父组件onRemove进行处理.
      this.$emit('onRemove')
    },
    /**
     * 文件超出个数限制时的钩子.
     */
    onExceed() {
      this.$message({
        message: '每次只能上传一本电子书',
        type: 'warning'
      })
    }
  }
}
</script>

<style scoped>

</style>
