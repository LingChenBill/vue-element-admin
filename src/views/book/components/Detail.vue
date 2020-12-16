<template>
  <el-form ref="postForm" :model="postForm" :rules="rules">
    <sticky :class-name="'sub-navbar'">
      <el-button v-if="!isEdit" @click="showGuide">显示帮助</el-button>
      <el-button
        v-loading="loading"
        type="success"
        @click="submitForm"
      >
        {{ isEdit ? '编辑电子书' : '新增电子书' }}
      </el-button>
    </sticky>
    <div class="detail-container">
      <el-row>
        <warning />
        <el-col :span="24">
          <ebook-upload
            :file-list="fileList"
            :disabled="isEdit"
            @onSuccess="onUploadSuccess"
            @onRemove="onUploadRemove"
          />
        </el-col>
      </el-row>
      <el-row>
        <!--表单控件的具体样式.-->
        <el-col :span="24">
          <el-form-item prop="title">
            <MdInput v-model="postForm.title" :maxlength="100">
              书名
            </MdInput>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item prop="author" label="作者: " :label-width="labelWidth">
            <el-input
              v-model="postForm.author"
              placeholder="作者"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="publisher" label="出版社: " :label-width="labelWidth">
            <el-input
              v-model="postForm.publisher"
              placeholder="出版社"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item prop="language" label="语言: " :label-width="labelWidth">
            <el-input
              v-model="postForm.language"
              placeholder="语言"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="rootFile" label="根文件: " :label-width="labelWidth">
            <el-input
              v-model="postForm.rootFile"
              placeholder="根文件"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item prop="filePath" label="文件路径: " :label-width="labelWidth">
            <el-input
              v-model="postForm.filePath"
              placeholder="文件路径"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="unzipPath" label="解压路径: " :label-width="labelWidth">
            <el-input
              v-model="postForm.unzipPath"
              placeholder="文件名称"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item prop="coverPath" label="封面路径: " :label-width="labelWidth">
            <el-input
              v-model="postForm.coverPath"
              placeholder="封面路径"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="originalName" label="文件名称: " :label-width="labelWidth">
            <el-input
              v-model="postForm.originalName"
              placeholder="文件名称"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item prop="cover" label="封面: " :label-width="labelWidth">
            <!--点击图片打开新窗口查看大图.-->
            <a v-if="postForm.cover" :href="postForm.cover" target="_blank">
              <img :src="postForm.cover" class="preview-img">
            </a>
            <span v-else>无</span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label-width="120px" label="目录: ">
            <div v-if="contentsTree && contentsTree.length > 0" class="contents-wrapper">
              <el-tree
                :data="contentsTree"
                @node-click="onContentClick"
              />
            </div>
            <span v-else>无</span>
          </el-form-item>
        </el-col>
      </el-row>
    </div>
  </el-form>
</template>

<script>
import Sticky from '@/components/Sticky/index'
import Warning from './Warning'
import EbookUpload from '@/components/EbookUpload'
import MdInput from '@/components/MDinput/index'
import { createBook, getBook, updateBook } from '@/api/book'

export default {
  name: 'Detail',

  components: {
    MdInput,
    Sticky,
    Warning,
    EbookUpload
  },

  props: {
    // 创建与编辑flg.
    isEdit: Boolean
  },

  data() {
    const validateRequire = (rule, value, callback) => {
      if (value.length === 0) {
        callback(new Error(fields[rule.field] + '不能为空'))
      } else {
        callback()
      }
    }
    // 表单字段映射.
    const fields = {
      title: '书名',
      author: '作者',
      publisher: '出版社',
      language: '语言'
    }
    return {
      // 加载标识符.
      loading: false,
      // 表单Form.
      postForm: {
        status: 'deleted'
      },
      // 文件列表.
      fileList: [],
      // 表单标签宽度.
      labelWidth: '120px',
      // 树状目录.
      contentsTree: [],
      // 表单验证规则.
      rules: {
        title: [{ validator: validateRequire }],
        author: [{ validator: validateRequire }],
        publisher: [{ validator: validateRequire }],
        language: [{ validator: validateRequire }]
      },
      // 表单默认值.
      defaultForm: {
        title: '',
        author: '',
        publisher: '',
        language: '',
        rootFile: '',
        cover: '',
        url: '',
        originalName: '',
        fileName: '',
        coverPath: '',
        filePath: '',
        unzipPath: ''
      }
    }
  },

  created() {
    // 表单默认值设置.
    this.postForm = this.defaultForm

    if (this.isEdit) {
      // 获取文件名.
      const fileName = this.$route.params.fileName
      // 调用获取电子书方法.
      this.getBookData(fileName)
    }
  },

  methods: {
    // 显示帮助.
    showGuide() {
      console.log('show guide......')
    },

    // 表单提交.
    submitForm() {
      /**
      /**
       * 成功时处理.
       * 说明:嵌套的function方法中不能使用this,可以改用 => 箭头函数取this.
       * @param response
       */
      const onSuccess = (response) => {
        // 获取返回信息.
        const { msg } = response
        this.$notify({
          title: '操作成功',
          message: msg,
          type: 'success',
          duration: 2000
        })
        console.log('11111')
        this.loading = false
      }

      if (!this.loading) {
        this.loading = true
        this.$refs.postForm.validate((valid, fields) => {
          if (valid) {
            // 验证通过,进行提交处理.
            // 表单项目浅拷贝.
            // const book = { ...this.postForm }
            const book = Object.assign({}, this.postForm)
            // 将目录内容也传入后台.
            // delete book.contents
            delete book.contentsTree
            if (!this.isEdit) {
              // 新增电子书.
              createBook(book).then(response => {
                // 处理成功信息.
                onSuccess(response)
                // 将表单重置.
                this.setDefault()
              }).catch(() => {
                this.loading = false
              })
            } else {
              // 更新电子书.
              updateBook(book).then(response => {
                // 处理成功信息.
                onSuccess(response)
              }).catch(() => {
                this.loading = false
              })
            }
            this.loading = false
          } else {
            const message = fields[Object.keys(fields)[0]][0].message
            this.$message({
              message,
              type: 'error'
            })
            this.loading = false
          }
        })
      }
      // this.loading = true
      // // 模拟表单提交.
      // setTimeout(() => {
      //   this.loading = false
      // }, 1000)
    },

    /**
     * 上传成功处理.
     */
    onUploadSuccess(data) {
      // 上传成功后数据处理.
      this.setData(data)
    },

    /**
     * 数据处理.
     */
    setData(data) {
      const {
        title,
        author,
        publisher,
        language,
        rootFile,
        cover,
        url,
        originalName,
        contents,
        contentsTree,
        fileName,
        coverPath,
        filePath,
        unzipPath
      } = data

      this.postForm = {
        ...this.postForm,
        title,
        author,
        publisher,
        language,
        rootFile,
        cover,
        url,
        originalName,
        contents,
        contentsTree,
        fileName,
        coverPath,
        filePath,
        unzipPath
      }

      // 树状目录.
      this.contentsTree = contentsTree
      // 设置电子书列表.
      this.fileList = [{ name: originalName, url }]
    },

    /**
     * 树状目录章节点击事件.
     */
    onContentClick(data) {
      if (data.text) {
        // 在新的窗口打个该章节.
        window.open(data.text)
      }
    },

    /**
     * 点击删除处理.
     */
    onUploadRemove() {
      this.setDefault()
    },

    /**
     * 设置表单默认值.
     */
    setDefault() {
      // 将表单清空.
      // this.postForm = Object.assign({}, this.defaultForm)
      // 将树状目录清空.
      this.contentsTree = []
      // 将上传列表清空.
      this.fileList = []
      // 清除校验信息.
      this.$refs.postForm.resetFields()
    },

    /**
     * 获取电子书内容.
     * @param fileName
     */
    getBookData(fileName) {
      // 调用获取电子书api接口.
      getBook(fileName).then(response => {
        console.log('book get: ', response.data)
        // 设置电子书信息.
        this.setData(response.data)
      }).catch(() => {
        // 处理错误信息.
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .detail-container {
    margin: 20px 40px 20px;

    .preview-img {
      width: 200px;
      height: 270px;
    }
  }
</style>
