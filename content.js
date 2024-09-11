// 内容脚本在特定的网站页面上运行，能够访问和操作页面的DOM。
// 它的主要功能是从Chrome存储中获取用户的简历信息，并自动填充到目标网页的表单字段中。

// 自动填充表单字段的函数
function autoFillForm(resumeData) {
  // 填充姓名
  const nameInput = document.querySelector('input[id="name"]');
  if (nameInput) {
      nameInput.value = resumeData.name || '';
  }

  // 填充手机号码
  const mobileInput = document.querySelector('input[id="mobile"]');
  if (mobileInput) {
      mobileInput.value = resumeData.mobile || '';
  }

  // 填充邮箱
  const emailInput = document.querySelector('input[id="email"]');
  if (emailInput) {
      emailInput.value = resumeData.email || '';
  }

  // 填充个人证件
  const idInput = document.querySelector('input[class="id-card-input"]');
  if (idInput) {
      idInput.value = resumeData.identification || '';
  }

  // 填充意向地点
  const cityInput = document.querySelector('input[class="atsx-select-search__field"]');
  if (cityInput) {
      cityInput.value = resumeData.preferred_city || '';
      const event = new Event('input', { bubbles: true }); // 触发 input 事件来更新 DOM
      cityInput.dispatchEvent(event);
  }

  // 如果意向地点是下拉选择框，则模拟点击选项
  const citySelectArrow = document.querySelector('.atsx-select-arrow-icon');
  if (citySelectArrow) {
      citySelectArrow.click();  // 打开下拉框
      const cityOption = document.querySelector(`[data-cy-value="${resumeData.preferred_city}"]`);
      if (cityOption) {
          cityOption.click();  // 选择指定的意向地点
      }
  }
}

// 使用 MutationObserver 来监听 DOM 变化
const observer = new MutationObserver((mutations, observer) => {
  const nameInput = document.querySelector('input[id="name"]');
  if (nameInput) {
      // 当检测到表单出现时，自动填充表单
      chrome.storage.local.get("resumeData", function (data) {
          if (data && data.resumeData) {
              autoFillForm(data.resumeData);
          }
      });
      observer.disconnect(); // 完成后停止观察
  }
});

// 开始观察 DOM 变化
observer.observe(document.body, {
  childList: true,
  subtree: true
});
