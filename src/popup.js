document.addEventListener('DOMContentLoaded', function () {
  // 检查当前网站是否匹配
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
      const currentTab = tabs[0];
      const url = new URL(currentTab.url);
      const websiteStatusElement = document.getElementById('websiteStatus');
      
      // 目标网站的域名匹配规则，例如 jobs.bytedance.com
      const targetDomain = 'jobs.bytedance.com';
      if (url.hostname === targetDomain) {
          websiteStatusElement.textContent = '当前网站匹配字节跳动招聘网站';
          websiteStatusElement.className = 'status match';
      } else {
          websiteStatusElement.textContent = '当前网站不匹配';
          websiteStatusElement.className = 'status nomatch';
      }
  });

  // 检查是否已填写个人信息
  chrome.storage.local.get("resumeData", function (data) {
      const infoStatusElement = document.getElementById('infoStatus');
      if (data.resumeData) {
          infoStatusElement.textContent = '您已填写个人信息';
          infoStatusElement.className = 'status filled';
      } else {
          infoStatusElement.textContent = '您尚未填写个人信息';
          infoStatusElement.className = 'status notfilled';
      }
  });

  // 点击按钮，跳转到新的标签页填写个人信息
  document.getElementById('openPage').addEventListener('click', function () {
      chrome.tabs.create({ url: chrome.runtime.getURL('info_form.html') });
  });

  // 点击自动填写按钮，调用内容脚本进行自动填写
  document.getElementById('autoFill').addEventListener('click', function () {
      // 获取当前标签页的ID，并在该页面上执行内容脚本
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          const activeTabId = tabs[0].id;
          
          // 从存储中获取个人信息
          chrome.storage.local.get("resumeData", function (data) {
              if (data.resumeData) {
                  // 将个人信息传递给内容脚本进行自动填写
                  chrome.scripting.executeScript({
                      target: { tabId: activeTabId },
                      function: fillForm, // 传递自动填写的函数
                      args: [data.resumeData] // 传递简历数据
                  });
              } else {
                  alert("尚未填写个人信息，无法自动填写！");
              }
          });
      });
  });

  // 内容脚本中用于自动填写的函数
  function fillForm(resumeData) {
    const nameInput = document.querySelector('input[id="name"]');
    if (nameInput) {
        nameInput.value = resumeData.name || '';
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));  // 模拟输入事件
        nameInput.dispatchEvent(new Event('change', { bubbles: true })); // 模拟 change 事件
    }

    const mobileInput = document.querySelector('input.atsx-input.atsx-input-lg.atsx-phone-input[type="text"]');
    if (mobileInput) {
        mobileInput.value = resumeData.mobile || '';
        mobileInput.dispatchEvent(new Event('input', { bubbles: true }));
        mobileInput.dispatchEvent(new Event('change', { bubbles: true }));
    }

    const emailInput = document.querySelector('input[id="email"]');
    if (emailInput) {
        emailInput.value = resumeData.email || '';
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        emailInput.dispatchEvent(new Event('change', { bubbles: true }));
    }

    const experienceInput = document.querySelector('textarea[id="experience"]');
    if (experienceInput) {
        experienceInput.value = resumeData.experience || '';
        experienceInput.dispatchEvent(new Event('input', { bubbles: true }));
        experienceInput.dispatchEvent(new Event('change', { bubbles: true }));
    }

    const awardsInput = document.querySelector('textarea[id="awards"]');
    if (awardsInput) {
        awardsInput.value = resumeData.awards || '';
        awardsInput.dispatchEvent(new Event('input', { bubbles: true }));
        awardsInput.dispatchEvent(new Event('change', { bubbles: true }));
    }

    const cityInput = document.querySelector('input[id="preferred_city"]');
    if (cityInput) {
        cityInput.value = resumeData.preferred_city || '';
        cityInput.dispatchEvent(new Event('input', { bubbles: true }));
        cityInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
}

});
