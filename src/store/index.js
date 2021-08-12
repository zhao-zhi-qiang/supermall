import Vue from "vue";
import Vuex from "vuex";

// 1.安装插件
Vue.use(Vuex)

// 2.创建Store对象
const store = new Vuex.Store({
  state: {
    cartList: []
  },
  mutations:{
    addCart(state, payload){
      // payload新添加的商品
      // 数组常用方法 join/push/pop/unshift/sort/reverse/map/filter/reduce
      /*let oldProduct = null;
      for (let item of state.cartList) {
        if (item.iid === payload.iid){
          oldProduct = item;
        }
      }*/
      /*let index = state.cartList.indexOf(payload)*/
    /*  let index = state.cartList.fin(function (item) {
        return item.iid === payload.iid
      })*/
      //查找之前数组中是否有该商品
      let oldProduct = state.cartList.find(item => item.iid === payload.iid)
      // 2.判断oldProduct
      if (oldProduct){
        oldProduct.count += 1
      } else {
        payload.count = 1
        state.cartList.push(payload)
      }
    }
  }
})

// 3.挂载Vue实例上
export default store
