<template>
    <!-- eslint-disable -->
    <div class="login-body">
        <div class="login">
            <h3>系统登录</h3>
            <h5>System Login Center</h5>
            <div class="item-box">
                <div class="input-group">
                    <span class="input-group-addon"><i class="el-icon-user"></i></span>
                    <VueInput class="login-input" v-model="account" placeholder="请输入账号" />
                </div>
            </div>
            <div class="item-box">
                <div class="input-group">
                    <span class="input-group-addon"><i class="el-icon-lock"></i></span>
                    <VueInput class="login-input" :type="isShow ? 'text' : 'password'" v-model="password"
                        placeholder="请输入密码" />
                    <i class="el-icon-view eye" v-if="password" @click="showps"></i>
                </div>
            </div>
            <div class="use-qrcode-a">
                <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAWCAYAAAAxSueLAAACsUlEQVRIiaWUX0hTURzHv5vLGe3qWqNUao4UKxBaTQWL2HzoL01yFCgR5IsVEc0ehRCJfFJU6iF92eghpWiJCkUQzhcfjOmSKRQKy2q21LW2Od0YW5ybE3fdvedqXzjnnvs7v9/58Dv3d3+SZDIJrmwBr3GLkUfKLFngCrPfJcZXlsnoia9qWxfnWgBoRZzhsezVdHfmH+2iOWbMjGgg9EvX4HVbA4m4TgxwRFNebdyj8gg5Sfk2yNWMFFVUK6UyMVekbV1ib0JQvDAiXQ4TEAt0RH4bHSt+wWsXhG0TSM2O95txZfvzw9jgnbZSisbzKbfi+PTUYtm3hdDBPEYePJSvmL90RjvDwnreJs9BAjSex3sasMn32dLl/3o/E1A+FoZ8bAW7vqxxtybI9Lzt7A229Hvf4RZ50oCdB450OVb8Blc0hBRQEklAYVtGtivCG5fKLvXNzATYMYCrtOwmD1fVKqWyQAqU1+4TBLExr+prwSkQc98o6mse4QkNaNlX1C2JJDwElPU9JuQ6UXextC/1wq1Gs9ePwupmWPtGcYrvhBZ1sS2v3ReggFg9bTa0p9aZ2pU5tAp0DCDX4Yax5y7auA4nrvW/yfoZS1A4aVnxwTagzlmgvAmvL1diqO50tH/wg7vm2cvpO8FwNBfAye1kRYOxQDINj8M8PC63hpcYxCQqAAs0zkTzbcNjrpEGS5NCXcqOeDSEoM+NtfACYpHlNJ8cpmDsWJl+5sH1Avt/wTaC5AxUmip2TcDxWPifPVsxqClg5gcf4l7GuJ3AuGAyANgLVfDygYik+hK2ndjXx05lN1VgSAiEzY249QVuDn2Ead1uFgm164vhbLyAXn0JlmjOW7o+gTrnoCc/dwYwmz2zG0FDGUZNlRgWA+GFbZZzFupNUFamSkyJPTxNAP4COJACyriRj5wAAAAASUVORK5CYII="
                    alt="" />
                <a class="use-ding" href="javascript:void(0)">飞书登录</a>
            </div>
            <div class="login-btn">
                <VueButton class="primary big" label="登录" :disabled="isFull" @click="login" />
            </div>
        </div>
        <div class="wrapper">
            <div><span class="dot"></span></div>
            <div><span class="dot"></span></div>
            <div><span class="dot"></span></div>
            <div><span class="dot"></span></div>
            <div><span class="dot"></span></div>
            <div><span class="dot"></span></div>
            <div><span class="dot"></span></div>
            <div><span class="dot"></span></div>
            <div><span class="dot"></span></div>
            <div><span class="dot"></span></div>
            <div><span class="dot"></span></div>
        </div>
    </div>
</template>
<script>
/* eslint-disable */
export default {
    name: "login",
    data() {
        return {
            account: "",
            password: '',
            isShow: false
        }
    },
    computed: {
        isFull() {
            return this.account === '' || this.password === ''
        }
    },
    mounted() {

    },
    methods: {
        showps() {
            this.isShow = !this.isShow
        },
        login() { }
    }
}
</script>
<style lang="stylus">
.login-input
    flex 1
    .content
        border none!important
    .input
        height 38px!important
</style>
<style lang="stylus" scoped>
@import "~@/style/imports"

@keyframes box1 {
  from {
    opacity: 0.5;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.login-body
    width 100%
    height 100%
    background #304457
    overflow hidden
.login
    box-sizing border-box
    width 400px
    height 350px
    margin -200px 0 0 -200px
    position absolute
    left 50%
    top 50%
    z-index 1000
    padding 40px
    border-radius 6px
    background #1d2935
    color #fff
    animation box1 .6s ease-in-out

    h3
        font-size 26px
        text-align center
        line-height 1
        
    h5 
        font-size 20px
        text-align center
        line-height 1
        border-bottom 1px solid #304457
        padding-bottom 10px
        margin-top 15px
        margin-bottom 15px

.input-group
    display flex
    margin-bottom 15px
    border-radius 4px
    background #fff
    .input-group-addon
        display flex
        align-items center
        justify-content center
        width 43px
        border none
        i
            color rgba(38,43,54,.9)
            font-size 24px
    .eye
        display flex
        align-items center
        justify-content center
        margin-right 10px
        font-size 16px
        color #99a9bf

.use-qrcode-a
    display flex
    justify-content flex-end
    align-items center
    margin-bottom 15px
    font-size 14px
    img{
        height 15px
    }

.login-btn
    display flex
    justify-content center
    .big
        width 100%
        height 40px

.wrapper div {
    height 60px;
    width 60px;
    border 2px solid rgba(255,255,255,0.7);
    border-radius 100px;
    position absolute;
    top 10%;
    left 10%;
    animation animate 5s linear infinite
}

div .dot {
    height: 5px;
    width: 5px;
    border-radius: 50px;
    background: rgba(255,255,255,0.5);
    position: absolute;
    top: 20%;
    right: 20%
}
.wrapper div:nth-child(2) {
    top: 20%;
    left: 20%;
    animation: animate 8.5s linear infinite
}

.wrapper div:nth-child(2) {
    top: 20%;
    left: 20%;
    animation: animate 8s linear infinite
}

.wrapper div:nth-child(3) {
    top: 60%;
    left: 80%;
    animation: animate 10.3s linear infinite
}

.wrapper div:nth-child(4) {
    top: 40%;
    left: 40%;
    animation: animate 9s linear infinite
}

.wrapper div:nth-child(5) {
    top: 66%;
    left: 30%;
    animation: animate 7s linear infinite
}

.wrapper div:nth-child(6) {
    top: 90%;
    left: 10%;
    animation: animate 9s linear infinite
}

.wrapper div:nth-child(7) {
    top: 30%;
    left: 60%;
    animation: animate 5s linear infinite
}

.wrapper div:nth-child(8) {
    top: 70%;
    left: 20%;
    animation: animate 8s linear infinite
}

.wrapper div:nth-child(9) {
    top: 75%;
    left: 60%;
    animation: animate 9.5s linear infinite
}

.wrapper div:nth-child(10) {
    top: 50%;
    left: 50%;
    animation: animate 6s linear infinite
}

.wrapper div:nth-child(11) {
    top: 45%;
    left: 85%;
    animation: animate 11s linear infinite
}

@keyframes animate {
    0% {
        transform: scale(0) translateY(0) rotate(70deg)
    }

    100% {
        transform: scale(1.3) translateY(-150px) rotate(360deg)
    }
}
</style>