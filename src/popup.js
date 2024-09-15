document.addEventListener('DOMContentLoaded', function () {
    // 检查当前网站是否匹配
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
        const currentTab = tabs[0];
        const url = new URL(currentTab.url);
        const websiteStatusElement = document.getElementById('websiteStatus');
        websiteStatusElement.textContent = '当前网站可用';
        websiteStatusElement.className = 'status match';
        
        // 目标网站的域名匹配规则，例如 jobs.bytedance.com
        // const targetDomain = 'jobs.bytedance.com';
        // if (url.hostname === targetDomain) {
        //     websiteStatusElement.textContent = '当前网站匹配字节跳动招聘网站';
        //     websiteStatusElement.className = 'status match';
        // } else {
        //     websiteStatusElement.textContent = '当前网站不匹配';
        //     websiteStatusElement.className = 'status nomatch';
        // }
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
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const activeTabId = tabs[0].id;

            chrome.storage.local.get("resumeData", function (data) {
                if (data.resumeData) {
                    chrome.scripting.executeScript({
                        target: { tabId: activeTabId },
                        function: function (resumeData) {
                            // 定义同义词表
                            const synonyms = {
                                name: ['姓名', '名字', '全名'],
                                mobile: ['手机', '手机号', '手机号码', '电话', '联系方式'],
                                email: ['邮箱', '电子邮箱', '邮件'],
                                identification: ['身份证', '身份证号', '身份证号码'],

                                school: ['院校', '学校', '教育经历'],
                                degree: ['学历'],
                                fieldOfStudy: ['专业', '学习方向'],

                                company: ['公司', '企业', '工作单位'],
                                jobTitle: ['职位', '职称', '岗位'],
                                jobPeriod: ['工作时间', '工作周期'],

                                projectName: ['项目名称', '项目名', '项目'],
                                projectRole: ['项目角色', '角色'],
                                projectDescription: ['项目描述', '描述'],

                                skills: ['技能', '技能点', '技术'],
                            };

                            function getMatchedField(text) {
                                for (let field in synonyms) {
                                    if (synonyms[field].some(synonym => text.includes(synonym))) {
                                        return field;
                                    }
                                }
                                return null;
                            }

                            function findFields() {
                                const inputs = document.querySelectorAll('input, textarea');
                                const matchedFields = {};

                                inputs.forEach(input => {
                                    if (input.placeholder) {
                                        const matchedField = getMatchedField(input.placeholder);
                                        if (matchedField) {
                                            matchedFields[matchedField] = input;
                                        }
                                    }

                                    const label = input.closest('label') || document.querySelector(`label[for="${input.id}"]`);
                                    if (label && label.textContent) {
                                        const matchedField = getMatchedField(label.textContent);
                                        if (matchedField) {
                                            matchedFields[matchedField] = input;
                                        }
                                    }

                                    if (input.id || input.name) {
                                        const text = (input.id || input.name).toLowerCase();
                                        const matchedField = getMatchedField(text);
                                        if (matchedField) {
                                            matchedFields[matchedField] = input;
                                        }
                                    }
                                });

                                return matchedFields;
                            }

                            const fields = findFields();

                            for (let field in fields) {
                                if (resumeData[field] && fields[field]) {
                                    fields[field].value = resumeData[field];
                                    fields[field].dispatchEvent(new Event('input', { bubbles: true }));
                                    fields[field].dispatchEvent(new Event('change', { bubbles: true }));
                                }
                            }
                        },
                        args: [data.resumeData]
                    });
                } else {
                    alert("尚未填写个人信息，无法自动填写！");
                }
            });
        });
    });

});