<template>
  <div id="home">
    <nav-bar class="home-nav"><div slot="center">购物街</div></nav-bar>
    <tab-control :titles="['流行', '新款', '精选']"
                 @tabClick="tabClick"
                 ref="tabControl1"
                 class="tab-control"
                 v-show="isTabFixed"/>
     <scroll class="content"
              ref="scroll"
              :probe-type="3"
              @scroll="contentScroll"
              :pull-up-load="true"
              @pullingUp="loadMore">
       <home-swiper :banners="banners" @swiperImageLoad="swiperImageLoad"/>
       <recommend-view :recommends="recommends"/>
       <feature-view/>
       <tab-control :titles="['流行', '新款', '精选']"
                    @tabClick="tabClick"
                    ref="tabControl2"/>
       <goods-list :goods="showGoods"/>
     </scroll>

    <back-top @click.native="backClick" v-show="isShowBackTop"/>

  </div>
</template>

<script>
// 公共组件
import NavBar from "components/common/navbar/NavBar";
import TabControl from "components/content/tabControl/TabControl";
import GoodsList from "components/content/goods/GoodsList";
import GoodsListItem from "components/content/goods/GoodsListItem";
import Scroll from "components/common/scroll/Scroll";
import BackTop from "components/content/backTop/BackTop";


// 子组件
import HomeSwiper from "./childComps/HomeSwiper";
import RecommendView from "./childComps/RecommendView";
import FeatureView from "./childComps/Feature";

import {getHomeMultidata, getHomeGoods} from "network/home";
import {debounce} from "common/utils";

export default {
    name: "Home",
    components: {
      RecommendView,
      NavBar,
      HomeSwiper,
      FeatureView,
      TabControl,
      GoodsList,
      GoodsListItem,
      Scroll,
      BackTop
    },
    data() {
      return {
        banners: [],
        recommends: [],
        goods: {
          'pop': {page:0, list: []},
          'new': {page:0, list: []},
          'sell': {page:0, list: []}
        },
        currentType: 'pop',
        isShowBackTop: false,
        tabOffsetTop: 0,
        isTabFixed: false,
        saveY: 0
      }
    },
    computed: {
      showGoods(){
        return this.goods[this.currentType].list
      }
    },
    destroyed() {
      //console.log('home destroyed')
    },
    activated() {
      this.$refs.scroll.scrollTo(0, this.saveY, 0)
      this.$refs.scroll.refresh()
    },
    deactivated() {
      // 1.保存Y值得
      this.saveY = this.$refs.scroll.getScrollY()
      //console.log(this.saveY)
    },
    created() {
      // 1.请求多个数据
      this.getHomeMultidata()

      // 2.请求商品数据
      this.getHomeGoods('pop')
      this.getHomeGoods('new')
      this.getHomeGoods('sell')
    },
    mounted() {
      // 1.监听item中图片加载完成事件
      const refresh = debounce(this.$refs.scroll.refresh,50)
      this.$bus.$on('itemImageLoad', () => {
        //console.log('--------------')
        //this.$refs.scroll.refresh()
        refresh()
      })
    },
    methods: {
      // 事件监听相关方法
      tabClick(index){
        switch (index){
          case 0:
            this.currentType = 'pop'
            break
          case 1:
            this.currentType = 'new'
            break
          case 2:
            this.currentType = 'sell'
            break
        }
        this.$refs.tabControl1.currentIndex = index;
        this.$refs.tabControl2.currentIndex = index;
      },
      backClick(){
        this.$refs.scroll.scrollTo(0,0, 500);
      },
      contentScroll(position){
        //console.log('首页打印', position)
        // 1.判断BackTop是否显示
        this.isShowBackTop = (-position.y) > 1000

        // 2.决定tabControl是否吸顶(position: fixed)
        this.isTabFixed = (-position.y) > this.tabOffsetTop
      },
      // 下拉加载更多
      loadMore(){
        this.getHomeGoods(this.currentType)
        this.$refs.scroll.refresh()
      },
      // 监听轮播图
      swiperImageLoad(){
        //console.log(this.$refs.tabControl.$el.offsetTop);
        this.tabOffsetTop = this.$refs.tabControl2.$el.offsetTop;
      },
      // 网络请求相关方法
      getHomeMultidata(){
        getHomeMultidata().then(res => {
          //console.log(res);
          //this.result = res;
          this.banners = res.data.banner.list
          this.recommends = res.data.recommend.list
        })
      },
      getHomeGoods(type){
        const page = this.goods[type].page + 1
        getHomeGoods(type, page).then(res => {
          this.goods[type].list.push(...res.data.list)
          this.goods[type].page += 1

          this.$refs.scroll.finishPullUp()
        })
      }
    }
  }
</script>

<style scoped>
#home{
  /*padding-top: 44px;*/
  height: 100vh;
  position: relative;
}

.home-nav {
  background-color: var(--color-tint);
  color: #ffffff;
  /* 在使用浏览器原生滚动时,为了让导航不跟随一起滚动 */
 /* position: fixed;
  left: 0;
  right: 0;
  top: 0;
  z-index: 9;*/
}

/*.content{
  height: calc(100% - 93px);
  overflow: hidden;
  margin-top: 51px;
}*/

.content{
  overflow: hidden;
  position: absolute;
  top: 44px;
  bottom: 49px;
  left: 0;
  right: 0;
}

.tab-control{
  position: relative;
  z-index: 9;
}
</style>
