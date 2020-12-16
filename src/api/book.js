import request from '@/utils/request'

/**
 * 新增电子书.
 * @param book
 * @returns {*}
 */
export function createBook(book) {
  return request({
    url: 'book/create',
    method: 'post',
    data: book
  })
}

/**
 * 更新电子书.
 * @param book
 * @returns {AxiosPromise}
 */
export function updateBook(book) {
  return request({
    url: '/book/update',
    method: 'post',
    data: book
  })
}

/**
 * 获取电子书.
 * @param fileName
 * @returns {AxiosPromise}
 */
export function getBook(fileName) {
  return request({
    url: 'book/get',
    method: 'get',
    params: { fileName }
  })
}

/**
 * 获取电子书类型列表.
 */
export function getCategory() {
  return request({
    url: 'book/category',
    method: 'get'
  })
}

/**
 * 获取电子书列表数据.
 * @param params
 * @returns {AxiosPromise}
 */
export function listBook(params) {
  return request({
    url: '/book/list',
    method: 'get',
    params
  })
}

/**
 * 删除电子书.
 * @param fileName
 * @returns {AxiosPromise}
 */
export function deleteBook(fileName) {
  return request({
    url: 'book/delete',
    method: 'get',
    params: { fileName }
  })
}
