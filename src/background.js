// 背景脚本运行在插件的生命周期内，通常用于管理插件的全局状态和处理插件的事件。
// 它不直接与网页交互，但可以与内容脚本通信，处理插件的初始化和配置。
chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: autoFillForm
    });
  });
  
  function autoFillForm() {
    chrome.storage.local.get("resumeData", function (data) {
      const resumeData = data.resumeData;
      if (resumeData) {
        // 同样这里需要根据实际招聘网站的 DOM 结构修改选择器
        document.getElementById("name-field").value = resumeData.name || "";
        document.getElementById("degree-field").value = resumeData.degree || "";
        document.getElementById("experience-field").value = resumeData.experience || "";
        document.getElementById("awards-field").value = resumeData.awards || "";
      }
    });
  }
  