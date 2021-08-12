<template>
  <div id="detail">
    <detail-nav-bar class="detail-nav" @titleClick="titleClick" ref="nav"/>
    <scroll class="content"
            ref="scroll"
            :probe-type="3"
            @scroll="contentScroll">
    <!-- 属性: topImages 传入值: top-images-->
      <ul>
        <li v-for="item in $store.state.cartList">{{item}}</li>
      </ul>
      <detail-swiper :top-images="topImages"/>
      <detail-base-info :goods="goods"/>
      <detail-shop-info :shop="shop"/>
      <detail-goods-info :detail-info="detailInfo" @detailImageLoad="detailImageLoad"/>
      <detail-param-info ref="param" :param-info="paramInfo"/>
      <detail-comment-info ref="comment" :comment-info="commentInfo"/>
      <goods-list ref="recommend" :goods="recommends"/>
    </scroll>

    <detail-bottom-bar @addCart="addToCart"/>
    <back-top @click.native="backTop" v-show="isShowBackTop"/>
  </div>
</template>

<script>
import DetailNavBar from './childComps/DetailNavBar'
import DetailSwiper from './childComps/DetailSwiper'
import DetailBaseInfo from './childComps/DetailBaseInfo'
import DetailShopInfo from './childComps/DetailShopInfo'
import DetailGoodsInfo from './childComps/DetailGoodsInfo'
import DetailParamInfo from './childComps/DetailParamInfo'
import DetailCommentInfo from "./childComps/DetailCommentInfo";
import DetailBottomBar from "./childComps/DetailBottomBar";

import Scroll from 'components/common/scroll/Scroll'
import GoodsList from "components/content/goods/GoodsList";

import {getDetail, Goods, Shop, GoodsParam, getRecommend} from "network/detail";
import {debounce} from "@/common/utils";
import {backTopMixin} from "@/common/mixin";

export default {
  name: "Detail",
  components: {
    DetailNavBar,
    DetailSwiper,
    DetailBaseInfo,
    DetailShopInfo,
    DetailGoodsInfo,
    DetailParamInfo,
    Scroll,
    DetailCommentInfo,
    GoodsList,
    DetailBottomBar
  },
  mixins: [backTopMixin],
  data() {
    return {
      iid: null,
      topImages: [],
      goods: {},
      shop: {},
      detailInfo: {},
      paramInfo: {},
      commentInfo: {},
      recommends: [],
      themeTopYs: [],
      getThemeTopY: null,
      currentIndex: 0
    }
  },
  created() {
    // 1.保存传入的iid
    this.iid = this.$route.params.iid

    // 2.根据iid请求详情数据
    getDetail(this.iid).then(res => {
      // 1.获取顶部的图片轮播数据
      //console.log(res);
      const data = res.result;
      this.topImages = data.itemInfo.topImages

      // 2.获取商品信息
      this.goods = new Goods(data.itemInfo, data.columns, data.shopInfo.services)

      // 3.创建店铺信息的对象
      this.shop = new Shop(data.shopInfo)

      // 4.保存商品的详情数据
      this.detailInfo = data.detailInfo;

      // 5.获取参数的信息
      this.paramInfo = new GoodsParam(data.itemParams.info, data.itemParams.rule)

      // 6.获取评论信息
      if (data.rate.cRate !== 0) {
        this.commentInfo = data.rate.list[0]
      }

      // 1.第一次获取, 值不对
      // 原因: this.$refs.param.$el压根没有渲染

      /*this.themeTopYs = []

      this.themeTopYs.push(0)
      this.themeTopYs.push(this.$refs.param.$el.offsetTop)
      this.themeTopYs.push(this.$refs.comment.$el.offsetTop)
      this.themeTopYs.push(this.$refs.recommend.$el.offsetTop)
      console.log(this.themeTopYs)

      this.$nextTick(() => {
        // 2.第二次获取: 值不对
        // 原因: 图片没有计算在内
        // 根据最新数据, 对应的DOM已经渲染出来
        // 但是图片依然没有加载完(目前获取到的offsetTop不包含其中图片)
        // offsetTop值不对原因, 都是因为图片的问题
        this.themeTopYs = []

        this.themeTopYs.push(0)
        this.themeTopYs.push(this.$refs.param.$el.offsetTop)
        this.themeTopYs.push(this.$refs.comment.$el.offsetTop)
        this.themeTopYs.push(this.$refs.recommend.$el.offsetTop)
        console.log(this.themeTopYs)
      })*/
    })

    // 3.获取推荐数据
    getRecommend().then(res => {
      //console.log(res)
      this.recommends = res.data.list
      //console.log(this.recommends)
    })

    // 4.给getThemeTopY赋值
    this.getThemeTopY = debounce(() => {
      this.themeTopYs = []
      this.themeTopYs.push(0)
      this.themeTopYs.push(this.$refs.param.$el.offsetTop)
      this.themeTopYs.push(this.$refs.comment.$el.offsetTop)
      this.themeTopYs.push(this.$refs.recommend.$el.offsetTop)
      this.themeTopYs.push(Number.MAX_VALUE)
      //console.log(this.themeTopYs)
    }, 100)
  },
  methods: {
    detailImageLoad() {
     this.$refs.scroll.refresh()
      //console.log('++++++++++++++')
      //this.newRefresh()
      this.getThemeTopY()
    },
    titleClick(index){
      console.log(index)
      this.$refs.scroll.scrollTo(0, -this.themeTopYs[index], 100)
    },
    contentScroll(position){
      //console.log('位置',position)
      // 1.获取y值
      const positionY = -position.y

      // 2.positionY和title中值对比
      let length = this.themeTopYs.length
    /*  for (let i = 0; i < length; i++) {
        if (this.currentIndex !== i && ((i < length - 1 && positionY >= this.themeTopYs[i] && positionY <
          this.themeTopYs[i+1]) || (i === length - 1 && positionY >= this.themeTopYs[i]))){
          this.currentIndex = i;
          this.$refs.nav.currentIndex = this.currentIndex
        }
      }*/

      for (let i = 0; i < length - 1; i++) {
        if (this.currentIndex !== i && (positionY > this.themeTopYs[i] && positionY < this.themeTopYs[i+1])){
          this.currentIndex = i;
          this.$refs.nav.currentIndex = this.currentIndex
        }
      }

      // 3.是否显示回到底部
      /*this.isShowBackTop = -position.y > positionY*/
     /* this.isShowBackTop = (-position.y) > 1000*/
      this.listenShowBackTop(position)
    },
    addToCart(){
      // 1.获取商品信息(购物车需要信息)
      const product = {}
      product.image = this.topImages[0];
      product.title = this.goods.title;
      product.desc = this.goods.desc;
      product.price = this.goods.realPrice;
      product.iid = this.iid;
      console.log('商品信息',product)
      // 2.将商品添加到购物车
      this.$store.commit('addCart', product)
    }

  }
}
</script>

<style scoped>
#detail {
  position: relative;
  z-index: 9999;
  background-color: #fff;
  height: 100vh;
  overflow: hidden;
}

.detail-nav {
  position: relative;
  z-index: 9999;
  background-color: #fff;
}

.content {
  height: calc(100% - 44px - 49px);
}
</style>
