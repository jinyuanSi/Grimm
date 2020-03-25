import WxValidate from '../../utils/WxValidate.js';
const { register} = require('../../utils/requestUtil.js');
const { getVerifyCode } = require('../../utils/requestUtil.js');
const { verifyCode } = require('../../utils/requestUtil.js');
const apiUrl = require('../../config.js').apiUrl;

const app = getApp();

//配置规则
const rules1 = {
  tel: {
    required: true,
    tel: true
  },
  regcode: {
    required: true,
    minlength: 4
  },
  role: {
    required: true
  }
}
const rules2 = {
  name: {
    required: true
  },
  gender: {
    required: true
  },
  idcard: {
    required: true,
    idcard: true
  },
  linkaddress: {
    required: true
  },
  linktel: {
    required: true,
    tel: true
  }
}
const rules3 = {
  emergencyPerson: {
    required: true
  },
  emergencyTel: {
    required: true,
    tel: true
  },
  disabledID: {
    required: true
  }
}
const messages = {
  tel: {
    required: '请输入11位手机号码',
    tel: '请输入正确的手机号码',
  },
  regcode: {
    required: '请输入验证码',
    minlength: '请输入正确的验证码'
  },
  role: {
    required: '请选择注册身份'
  },
  name: {
    required: '请输入姓名'
  },
  gender: {
    required: '请选择性别'
  },
  idcard: {
    required: '请输入身份证号码',
    idcard: '请输入正确的身份证号码',
  },
  linkaddress: {
    required: '请输入联系地址'
  },
  linktel: {
    required: '请输入联系电话',
    tel: '请输入正确的联系手机号'
  },
  emergencyPerson: {
    required: '请输入紧急联系人姓名'
  },
  emergencyTel: {
    required: '请输入紧急联系人电话',
    tel: '请输入正确的紧急联系人手机号'
  },
  disabledID: {
    required: '请输入残疾人证'
  }
}

Page({

  /**
   * Page initial data
   */
  data: {
    form: {
      gender: '男',
      tel: '',
      idcard: '',
      regcode: '',
      role: '视障人士',
      name: '',
      birthdate: '',
      linkaddress: '',
      linktel: '',
      emergencyPerson: '',
      emergencyTel: '',
      disabledID: '',
      comment: ''
    },
    text: '获取验证码', //按钮文字
    currentTime: 60, //倒计时
    disabled: false,
    color: '#29a0de',
    registerStep: 'base',
    registeBaseActive: 'active',
    registeDetailActive: '',
    roles: [
      {
        index: 1,
        name: '视障人士',
        value: '视障人士',
        checked: true,
      }, 
      {
        index: 2,
        name: '志愿者',
        value: '志愿者',
        checked: false,
      }
    ],
    currentDate: '',

    // new
    phone: '',
    genders: ['男', '女'],
    genderIndex: 0,
    birthday: '',
    region: []
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    this.setData({
      phone: options.phone
    });
    // // 初始化表单
    // this.initValidate();
    // //获取当前日期
    // const newDate = new Date();
    // const currentYear = newDate.getFullYear();
    // const currentMonth = newDate.getMonth() + 1;
    // const currentDay = newDate.getDate();
    // this.setData({
    //   currentDate: `${currentYear}-${currentMonth}-${currentDay}`
    // })
  },


  changeName: function (e) {
    this.setData({
      // name : e.detail.value
    })
  },

  inputPhoneNum: function (e) {
    this.setData({
      'form.tel': e.detail.value
    })
  },

  formSubmit: function (e) {
    const params = e.detail.value
    if(this.data.form.role === '视障人士'){
      const disabledRule = Object.assign(rules2, rules3);
      const disabledWxValidate = new WxValidate(disabledRule, messages);
      if (!disabledWxValidate.checkForm(params)) {
        const error = disabledWxValidate.errorList[0]
        this.showModal(error)
        return false
      }
    }else{
      const volunteerWxValidate = new WxValidate(rules2, messages);
      if (!volunteerWxValidate.checkForm(params)) {
        const error = volunteerWxValidate.errorList[0]
        this.showModal(error)
        return false
      }
    }
    const birthdate = this.getBirthdayFromIdCard(e.detail.value.idcard)
    this.setData({'form.birthdate': birthdate})
    const formData = Object.assign(this.data.form, e.detail.value);
    console.log(formData)
    register(formData, (res)=>{
      wx.setStorageSync('isRegistered', true)
      wx.showToast({
        title: '注册成功',
        icon: 'success',
        duration: 3000
      });
      wx.switchTab({
        url: '../home/home',
      });
    },(err)=>{
      wx.showModal({
        showCancel: false,
        title: '注册失败',
        content: err || "网络失败，请稍候再试"
      });  
      wx.setStorageSync('isRegistered', false)
    });
  },

  nextStep: function(e){
    const params = {
      tel: this.data.form.tel,
      regcode: this.data.form.regcode,
      role: this.data.form.role
    };

    if (!this.WxValidate.checkForm(params)){
      const error = this.WxValidate.errorList[0]
      this.showModal(error)
      return false
    } else {
      const formData = {
        tel: this.data.form.tel,
        verification_code: this.data.form.regcode
      }
      verifyCode(formData, (res)=>{
        this.setData({
          registerStep: 'detail',
          registeBaseActive: '',
          registeDetailActive: 'active'
        })
      },(err)=>{
        wx.showModal({
          showCancel: false,
          title: '验证失败',
          content: err || "网络失败，请稍候再试"
        });
      })
    }
  },

  initValidate: function(){
    this.WxValidate = new WxValidate(rules1, messages)
  },

  showModal(error) {
    wx.showModal({
      title: '提示',
      content: error.msg
    })
  },

// new
  bindGenderChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      genderIndex: e.detail.value
    })
  },

  bindBirthdayChange: function(e) {
    this.setData({
      birthday: e.detail.value
    })
  },

  bindRegionChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      region: e.detail.value
    })
  },

  onSubmit: function() {
    wx.showToast({
      title: '注册成功',
      icon: 'success',
      duration: 2000
    });

    wx.navigateTo({
      url: '/pages/home/home',
    })

  //   register(formData, (res) => {
  //     wx.setStorageSync('isRegistered', true)
  //     wx.showToast({
  //       title: '注册成功',
  //       icon: 'success',
  //       duration: 3000
  //     });
  //     wx.switchTab({
  //       url: '../home/home',
  //     });
  //   }, (err) => {
  //     wx.showModal({
  //       showCancel: false,
  //       title: '注册失败',
  //       content: err || "网络失败，请稍候再试"
  //     });
  //     wx.setStorageSync('isRegistered', false)
  //   });
  }
})