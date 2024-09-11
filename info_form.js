document.addEventListener('DOMContentLoaded', function() {
    // 从存储中获取数据
    chrome.storage.local.get('resumeData', function(data) {
        if (data.resumeData) {
            const resumeData = data.resumeData;
            document.getElementById('name').value = resumeData.name || '';
            document.getElementById('mobile').value = resumeData.mobile || '';
            document.getElementById('email').value = resumeData.email || '';
            document.getElementById('identification').value = resumeData.identification || '';

            document.getElementById('school').value = resumeData.school || '';
            document.getElementById('degree').value = resumeData.degree || '';
            document.getElementById('fieldOfStudy').value = resumeData.fieldOfStudy || '';

            document.getElementById('company').value = resumeData.company || '';
            document.getElementById('jobTitle').value = resumeData.jobTitle || '';
            document.getElementById('jobPeriod').value = resumeData.jobPeriod || '';

            document.getElementById('projectName').value = resumeData.projectName || '';
            document.getElementById('projectRole').value = resumeData.projectRole || '';
            document.getElementById('projectDescription').value = resumeData.projectDescription || '';

            document.getElementById('skills').value = resumeData.skills || '';
        }
    });

    // 保存用户输入的信息
    document.getElementById('saveInfo').addEventListener('click', function() {
        const resumeData = {
            name: document.getElementById('name').value,
            mobile: document.getElementById('mobile').value,
            email: document.getElementById('email').value,
            identification: document.getElementById('identification').value,

            school: document.getElementById('school').value,
            degree: document.getElementById('degree').value,
            fieldOfStudy: document.getElementById('fieldOfStudy').value,

            company: document.getElementById('company').value,
            jobTitle: document.getElementById('jobTitle').value,
            jobPeriod: document.getElementById('jobPeriod').value,

            projectName: document.getElementById('projectName').value,
            projectRole: document.getElementById('projectRole').value,
            projectDescription: document.getElementById('projectDescription').value,

            skills: document.getElementById('skills').value,
        };

        chrome.storage.local.set({ resumeData: resumeData }, function() {
            alert('信息已保存！');
        });
    });
});

