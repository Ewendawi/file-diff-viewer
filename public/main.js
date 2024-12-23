let fileContents = [];

document.addEventListener('DOMContentLoaded', () => {
    fetch('/default-content')
        .then(response => response.json())
        .then(data => {
            fileContents = data.contents;
            console.log('Loaded default files:', fileContents.length);
            window.currentIndex = 0;
            displayCurrentPair();
        })
        .catch(err => {
            console.error('Error loading default content:', err);
        });
});

document.getElementById('jsonSelector').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                fileContents = data.contents;
                console.log('Loaded files:', fileContents.length);
            } catch (err) {
                console.error('Error parsing JSON:', err);
                alert('Invalid JSON file format');
            }
        };
        reader.readAsText(file);
    }
});

document.getElementById('loadJson').addEventListener('click', () => {
    if (fileContents.length === 0) {
        alert('Please select a JSON file first');
        return;
    }
    
    window.currentIndex = 0;
    displayCurrentPair();
});

document.getElementById('nextPair').addEventListener('click', () => {
    if (window.currentIndex < fileContents.length - 2) {
        window.currentIndex++;
        displayCurrentPair();
    }
});

document.getElementById('prevPair').addEventListener('click', () => {
    if (window.currentIndex > 0) {
        window.currentIndex--;
        displayCurrentPair();
    }
});

function updateNavigationButtons() {
    const prevButton = document.getElementById('prevPair');
    const nextButton = document.getElementById('nextPair');
    
    prevButton.disabled = !fileContents.length || window.currentIndex === 0;
    nextButton.disabled = !fileContents.length || window.currentIndex >= fileContents.length - 2;
}

function displayCurrentPair() {
    const file1 = fileContents[window.currentIndex];
    const file2 = fileContents[window.currentIndex + 1];
    
    document.getElementById('file1Header').textContent = file1.file_name;
    document.getElementById('file2Header').textContent = file2.file_name;
    document.getElementById('file1Desc').textContent = file1.desc;
    document.getElementById('file2Desc').textContent = file2.desc;
    compareContents(file1.code, file2.code);
    updateNavigationButtons();
}

function compareContents(content1, content2) {
    displayDiff(content1, content2);
}

function displayDiff(content1, content2) {
    const diff = Diff.createPatch('comparison',
        content1,
        content2,
        'Original',
        'Modified',
        { context: Infinity }
    );

    const changes = Diff.parsePatch(diff)[0].hunks;
    const file1Output = document.getElementById('file1Output');
    const file2Output = document.getElementById('file2Output');
    
    file1Output.innerHTML = '';
    file2Output.innerHTML = '';

    let lineBuffer1 = '';
    let lineBuffer2 = '';
    let line1Num = 1;
    let line2Num = 1;

    changes.forEach(hunk => {
        hunk.lines.forEach(line => {
            if (line[0] === ' ') {
                // Unchanged line - add to both columns with same height
                const lineContent = escapeHtml(line.slice(1));
                lineBuffer1 += `<div class="line" data-line="${line1Num}">${createLineContent(line1Num++, lineContent)}</div>`;
                lineBuffer2 += `<div class="line" data-line="${line2Num}">${createLineContent(line2Num++, lineContent)}</div>`;
            } else if (line[0] === '-') {
                // Removed line - add to left column and placeholder to right
                lineBuffer1 += `<div class="line line-removed" data-line="${line1Num}">${createLineContent(line1Num++, escapeHtml(line.slice(1)), true)}</div>`;
                lineBuffer2 += `<div class="line line-placeholder"></div>`;
            } else if (line[0] === '+') {
                // Added line - add placeholder to left and line to right
                lineBuffer1 += `<div class="line line-placeholder"></div>`;
                lineBuffer2 += `<div class="line line-added" data-line="${line2Num}">${createLineContent(line2Num++, escapeHtml(line.slice(1)), true)}</div>`;
            }
        });
    });

    file1Output.innerHTML = lineBuffer1;
    file2Output.innerHTML = lineBuffer2;

    // Sync scrolling
    setupScrollSync(file1Output, file2Output);
}

function createLineContent(lineNum, content, isModified = false) {
    const textClass = isModified ? 'text' : '';
    return `<span class="line-number">${lineNum}</span><span class="${textClass}">${content}</span>`;
}

function setupScrollSync(element1, element2) {
    let isScrolling = false;

    const syncScroll = (source, target) => {
        if (!isScrolling) {
            isScrolling = true;
            target.scrollTop = source.scrollTop;
            target.scrollLeft = source.scrollLeft;
            setTimeout(() => isScrolling = false, 10);
        }
    };

    element1.addEventListener('scroll', () => syncScroll(element1, element2));
    element2.addEventListener('scroll', () => syncScroll(element2, element1));
}

function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function readFileContent(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
    });
}