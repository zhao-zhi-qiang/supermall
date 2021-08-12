import {debounce} from "./utils";
import BackTop from "components/content/backTop/BackTop";

export const itemListenerMixin = {
  data() {
    return {
      itemListener: null,
      newRefresh: null
    }
  },
  mounted() {
    this.newRefresh = debounce(this.$refs.scroll.refresh, 100)
    this.itemListener = () => {
      newRefresh()
    }
    this.$bus.$on('itemImageLoad', this.itemListener)
    console.log('我是混入中的内容')
  }
}

export const backTopMixin = {
  components: {
    BackTop
  },
  data(){
    return {
      isShowBackTop: false
    }
  },
  methods: {
    backTop(){
      this.$refs.scroll.scrollTo(0, 0, 300)
    },
    listenShowBackTop(position){
      this.isShowBackTop = (-position.y) > 1000
    }
  }
}
