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
                            // 为不同来源定义不同的同义词表
                            const labelSynonyms = {
                                name: ['姓名', '名字', '全名'],
                                mobile: ['手机', '手机号', '手机号码', '电话'],
                                email: ['邮箱', '电子邮箱'],
                                identification: ['身份证', '身份证号'],
                                school: ['院校', '学校'],
                                degree: ['学历'],
                                fieldOfStudy: ['专业'],
                                company: ['公司', '企业'],
                                jobTitle: ['职位', '职称'],
                                jobPeriod: ['工作时间'],
                                projectName: ['项目名称'],
                                projectRole: ['项目角色'],
                                projectDescription: ['项目描述'],
                                skills: ['技能']
                            };

                            const placeholderSynonyms = {
                                name: ['姓名', '请输入姓名'],
                                mobile: ['手机号码', '请输入手机号码'],
                                email: ['邮箱地址', '请输入邮箱'],
                                identification: ['身份证号', '请输入身份证号'],
                                school: ['学校名称', '请输入学校名称'],
                                degree: ['学历'],
                                fieldOfStudy: ['专业'],
                                company: ['公司名称', '请输入公司名称'],
                                jobTitle: ['职位', '请输入职位'],
                                jobPeriod: ['工作时间'],
                                projectName: ['项目名称'],
                                projectRole: ['项目角色'],
                                projectDescription: ['项目描述'],
                                skills: ['技能']
                            };

                            const idNameSynonyms = {
                                name: ['name', 'fullName'],
                                mobile: ['mobile', 'phone'],
                                email: ['email', 'mail'],
                                identification: ['id', 'identity'],
                                school: ['school', 'college', 'university'],
                                degree: ['degree'],
                                fieldOfStudy: ['fieldOfStudy', 'major'],
                                company: ['company', 'employer'],
                                jobTitle: ['title', 'position'],
                                jobPeriod: ['jobPeriod'],
                                projectName: ['projectName'],
                                projectRole: ['projectRole'],
                                projectDescription: ['projectDescription'],
                                skills: ['skills', 'skillset']
                            };

                            // 匹配函数，使用指定的同义词表
                            function getMatchedField(text, synonymTable) {
                                const matches = [];
                                for (let field in synonymTable) {
                                    for (let synonym of synonymTable[field]) {
                                        if (text === synonym) {
                                            // 完全匹配，得分100
                                            matches.push({ field: field, score: 100 });
                                        } else if (text.includes(synonym)) {
                                            // 部分匹配，按比例计算得分
                                            const score = (synonym.length / text.length) * 100;
                                            matches.push({ field: field, score: score });
                                        }
                                    }
                                }
                                return matches;
                            }

                            // 通用的 findLabel 函数
                            function findLabel(input) {
                                // 1. 先检查是否有标准的 <label> 元素
                                let label = input.closest('label') || document.querySelector(`label[for="${input.id}"]`);

                                // 2. 如果没有标准的 <label>，向上遍历父级节点寻找 span 类名包含 'label' 的元素
                                if (!label) {
                                    let currentElement = input.parentElement;
                                    while (currentElement) {
                                        const spanLabel = currentElement.querySelector('span[class*="label"]');
                                        if (spanLabel) {
                                            label = spanLabel;
                                            break;
                                        }
                                        currentElement = currentElement.parentElement; // 向上遍历父级
                                    }
                                }

                                return label ? label.textContent : null;
                            }

                            // 查找字段
                            function findFields() {
                                const inputs = document.querySelectorAll('input, textarea');
                                const matchedFields = {};

                                inputs.forEach(input => {
                                    let bestMatch = { field: null, score: 0, element: null };

                                    // 1. 检查 label（权重 1.5）
                                    const labelText = findLabel(input);
                                    if (labelText) {
                                        const matches = getMatchedField(labelText);
                                        matches.forEach(match => {
                                            const weightedScore = match.score * 1.5; // label 权重 1.5
                                            if (weightedScore > bestMatch.score) {
                                                bestMatch = { ...match, score: weightedScore, element: input };
                                            }
                                        });
                                    }

                                    // 2. 检查 placeholder（权重 1.2）
                                    if (input.placeholder) {
                                        const matches = getMatchedField(input.placeholder, placeholderSynonyms);
                                        matches.forEach(match => {
                                            const weightedScore = match.score * 1.2; // 赋予 placeholder 权重 1.2
                                            if (weightedScore > bestMatch.score) {
                                                bestMatch = { ...match, score: weightedScore, element: input };
                                            }
                                        });
                                    }

                                    // 3. 检查 id 或 name 属性（权重 1.0）
                                    if (input.id || input.name) {
                                        const matches = getMatchedField((input.id || input.name).toLowerCase(), idNameSynonyms);
                                        matches.forEach(match => {
                                            const weightedScore = match.score * 1.0; // 赋予 id/name 权重 1.0
                                            if (weightedScore > bestMatch.score) {
                                                bestMatch = { ...match, score: weightedScore, element: input };
                                            }
                                        });
                                    }

                                    // 保存最佳匹配的字段
                                    if (bestMatch.field && bestMatch.score > 0) {
                                        matchedFields[bestMatch.field] = bestMatch.element;
                                    }
                                });

                                return matchedFields;
                            }

                            const fields = findFields();
                            console.log(fields);

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