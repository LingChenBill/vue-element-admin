<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.title"
        placeholder="书名"
        style="width: 200px"
        class="filter-item"
        clearable
        @keyup.enter.native="handleFilter"
        @clear="handleFilter"
        @blur="handleFilter"
      />
      <el-input
        v-model="listQuery.author"
        placeholder="作者"
        style="margin-left:10px; width: 200px"
        class="filter-item"
        clearable
        @keyup.enter.native="handleFilter"
        @clear="handleFilter"
        @blur="handleFilter"
      />
      <el-select
        v-model="listQuery.category"
        placeholder="类型"
        clearable
        style="margin-left: 10px; width: 350px"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option
          v-for="item in categoryList"
          :key="item.value"
          :label="`${item.label}(${item.num})`"
          :value="item.label"
        />
      </el-select>
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        style="margin-left: 10px"
        @click="handleFilter"
      >
        查询
      </el-button>
      <el-button
        class="filter-item"
        type="primary"
        icon="el-icon-edit"
        style="margin-left: 10px"
        @click="handleCreate"
      >
        新增
      </el-button>
      <el-checkbox
        v-model="showCover"
        class="filter-item"
        style="margin-left: 10px"
        @change="changeShowCover"
      >
        显示封面
      </el-checkbox>
    </div>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%"
      :default-sort="defaultSort"
      @sort-change="sortChange"
    >
      <!--传统的列表的列展示方式.-->
      <el-table-column
        label="ID"
        prop="id"
        sortable="custom"
        align="center"
        width="80"
      />

      <el-table-column
        label="书名"
        align="center"
      >
        <template slot-scope="{ row: { titleWrapper } }">
          <span v-html="titleWrapper" />
        </template>
      </el-table-column>

      <el-table-column
        label="作者"
        width="150"
        align="center"
      >
        <!--插槽的方式.-->
        <template slot-scope="{ row: { authorWrapper } }">
          <span v-html="authorWrapper" />
        </template>
      </el-table-column>

      <el-table-column
        label="出版社"
        prop="publisher"
        width="150"
        align="center"
      />

      <el-table-column
        label="分类"
        prop="categoryText"
        width="100"
        align="center"
      />

      <el-table-column
        label="语言"
        prop="language"
        width="50"
        align="center"
      />

      <el-table-column
        v-if="showCover"
        label="封面"
        width="150"
        align="center"
      >
        <!--<template-->
        <!--  slot-scope="scope"-->
        <!--&gt;-->
        <!--  <a :href="scope.row.cover" target="_blank">-->
        <!--    <img :src="scope.row.cover" style="width:120px; height:180px">-->
        <!--  </a>-->
        <!--</template>-->
        <template
          slot-scope="{ row : { cover }}"
        >
          <a :href="cover" target="_blank">
            <img :src="cover" style="width:120px; height:180px">
          </a>
        </template>
      </el-table-column>

      <el-table-column
        label="文件名"
        prop="fileName"
        width="100"
        align="center"
      />

      <el-table-column
        label="文件路径"
        prop="filePath"
        width="100"
        align="center"
      >
        <template slot-scope="{ row: { filePath }}">
          {{ filePath | valueFilter }}
        </template>
      </el-table-column>

      <el-table-column
        label="解压路径"
        prop="unzipPath"
        width="100"
        align="center"
      >
        <template slot-scope="{ row: { unzipPath }}">
          {{ unzipPath | valueFilter }}
        </template>
      </el-table-column>

      <el-table-column
        label="上传人"
        prop="createUser"
        width="100"
        align="center"
      >
        <template slot-scope="{ row: { createUser }}">
          {{ createUser | valueFilter }}
        </template>
      </el-table-column>

      <el-table-column
        label="上传时间"
        prop="createDt"
        width="100"
        align="center"
      >
        <template slot-scope="{ row: { createDt }}">
          {{ createDt | timeFilter }}
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        width="120"
        align="center"
        fixed="right"
      >
        <template slot-scope="{ row }">
          <el-button type="text" icon="el-icon-edit" @click="handleUpdate(row)" />
          <el-button type="text" icon="el-icon-delete" style="color: red" @click="handleDelete(row)" />
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.pageSize"
      @pagination="refresh"
    />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination/index'
import waves from '@/directive/waves/waves'
import { getCategory, listBook, deleteBook } from '@/api/book'
import { parseTime } from '@/utils'

export default {
  components: { Pagination },
  directives: { waves },
  filters: {
    // 字段是否为空过滤器.
    valueFilter(value) {
      return value || '无'
    },
    // 时间过滤器.
    timeFilter(time) {
      return time ? parseTime(time, '{y}/{m}/{d} {h}:{i}') : '无'
    }
  },
  data() {
    return {
      // 列表查询条件.
      listQuery: {},
      // 显示封面flg.
      showCover: false,
      // 类型列表.
      categoryList: [],
      // 列表key.
      tableKey: 0,
      // 列表加载flg.
      listLoading: true,
      // 列表.
      list: [],
      // 列表总记录数.
      total: 0,
      // 默认排序.
      defaultSort: {}
    }
  },
  created() {
    // 解析查询参数.
    this.parseQuery()
    this.getList()
  },
  mounted() {
    // 获取类型.
    this.getCategoryList()
  },

  /**
   * 路由更新的勾子函数.
   */
  beforeRouteUpdate(to, from, next) {
    if (to.path === from.path) {
      // 获取路由后面的参数.
      const newQuery = Object.assign({}, to.query)
      const oldQuery = Object.assign({}, from.query)
      // 若路由参数更新后,重新刷新列表.
      if (JSON.stringify(newQuery) !== JSON.stringify(oldQuery)) {
        this.getList()
      }
    }
    next()
  },
  methods: {

    /**
     * 解析查询参数.
     */
    parseQuery() {
      // 获取当前路由的query.
      const query = Object.assign({}, this.$route.query)
      // 默认排序.
      let sort = '+id'
      // 设置默认列表查询参数.
      const listQuery = {
        // 当前页.
        page: 1,
        // 一页记录数.
        pageSize: 20,
        // 默认排序.
        sort
      }

      if (query) {
        // 对路由参数类型转换.
        query.page && (query.page = +query.page)
        query.pageSize && (query.pageSize = +query.pageSize)
        query.sort && (sort = query.sort)
      }

      const sortSymbol = sort[0]
      const sortColumn = sort.slice(1, sort.length)
      // 默认排序设置.
      this.defaultSort = {
        prop: sortColumn,
        order: sortSymbol === '+' ? 'ascending' : 'descending'
      }

      // 将listQuery合并.
      this.listQuery = { ...listQuery, ...query }
    },

    /**
     * 获取类型列表.
     */
    getCategoryList() {
      // 调用category接口.
      getCategory().then(response => {
        this.categoryList = response.data
      })
    },

    /**
     * 查询处理.
     */
    handleFilter() {
      // 将页码重置为1.
      this.listQuery.page = 1
      // 重新刷新列表.
      this.refresh()
      // this.getList()
    },

    /**
     * 重新刷新列表.
     */
    refresh() {
      // 重置路由参数.
      this.$router.push({
        path: '/book/list',
        query: this.listQuery
      })
    },

    /**
     * 创建电子书.
     */
    handleCreate() {
      this.$router.push('/book/create')
    },

    /**
     * 显示封面.
     */
    changeShowCover(value) {
      this.showCover = value
    },

    /**
     * 获取列表.
     */
    getList() {
      this.listLoading = true
      listBook(this.listQuery).then(response => {
        // 解析出列表.
        const { list, count } = response.data
        this.list = list
        // 加载状态重置.
        this.listLoading = false
        // 列表总记录数.
        this.total = count
        // 将数据进行高亮处理.
        this.list.forEach(book => {
          book.titleWrapper = this.wrapperKeyword('title', book.title)
          book.authorWrapper = this.wrapperKeyword('author', book.author)
        })
      })
    },

    /**
     * 将文本进行高亮处理.
     */
    wrapperKeyword(key, value) {
      function highlight(value) {
        return `<sapn style="color: #1890ff">${value}</sapn>`
      }
      if (!this.listQuery[key]) {
        return value
      } else {
        // i: 不区分大小写.
        // g: 全局,查找所有.
        return value.replace(new RegExp(this.listQuery[key], 'ig'), value => highlight(value))
      }
    },

    /**
     * 列表排序.
     */
    sortChange(data) {
      const { prop, order } = data
      // 排序处理.
      this.sortBy(prop, order)
    },

    /**
     * 排序封装处理.
     */
    sortBy(prop, order) {
      // 若是升序,+prop.
      // 若是降序,-prop.
      if (order === 'ascending') {
        this.listQuery.sort = `+${prop}`
      } else {
        this.listQuery.sort = `-${prop}`
      }
      this.handleFilter()
    },

    /**
     * 编辑电子书.
     * @param row
     */
    handleUpdate(row) {
      // 用{row.fileName}需要使用反漂号.
      // 跳转到电子书编辑画面.
      this.$router.push(`/book/edit/${row.fileName}`)
    },

    /**
     * 删除电子书.
     * @param row
     */
    handleDelete(row) {
      // 删除确认框.
      this.$confirm('此操作将永久删除该电子书,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteBook(row.fileName).then(response => {
          this.$notify({
            title: response.msg || '删除成功',
            message: response.msg,
            type: 'success',
            duration: 2000
          })
          // 刷新列表.
          this.getList()
        })
      }).catch(() => {})
    }
  }
}

</script>

<style scoped>

</style>
