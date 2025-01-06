let fileContents = [];
let fileContentMap = {};
let experimentMap = [];

document.addEventListener('DOMContentLoaded', () => {
    fetch('/default-content.json')
        .then(response => response.json())
        .then(data => {
            fileContentMap = data.contents;
            experimentMap = data.experiments;
            fileContents = Object.values(fileContentMap);
            console.log('Loaded default files:', Object.keys(fileContentMap).length);
            window.currentIndex = 0;

            // //#TEST
            // document.getElementById('twoColumnView').style.display = 'flex';
            // document.getElementById('oneColumnView').style.display = 'none';
            // displayCurrentPair();

            displayCurrentFile();
            populateFilterOptions();
            updateFileContentsCount(); // Update count on load
        })
        .catch(err => {
            console.error('Error loading default content:', err);
        });

    document.getElementById('applyFilters').addEventListener('click', applyFilters);
    document.getElementById('resetFilters').addEventListener('click', resetFilters); // Add event listener
});

document.getElementById('jsonSelector').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                fileContentMap = data.contents;
                experimentMap = data.experiments;
                fileContents = Object.values(fileContentMap);
                console.log('Loaded files:', Object.keys(fileContentMap).length);
                populateFilterOptions();

                window.currentIndex = 0;
                if (document.getElementById('twoColumnView').style.display !== 'none') {
                    displayCurrentPair();
                } else {
                    displayCurrentFile();
                }
                updateFileContentsCount(); // Update count on load
            } catch (err) {
                console.error('Error parsing JSON:', err);
                alert('Invalid JSON file format');
            }
        };
        reader.readAsText(file);
    }
});

document.getElementById('nextPair').addEventListener('click', () => {
    const twoColumnView = document.getElementById('twoColumnView');
    if (twoColumnView.style.display !== 'none') {
        if (window.currentIndex < fileContents.length - 2) {
            window.currentIndex++;
            updateFileContentsCount();
            displayCurrentPair();
        }
    } else {
        if (window.currentIndex < fileContents.length - 1) {
            window.currentIndex++;
            updateFileContentsCount();
            displayCurrentFile();
        }
    }
});

document.getElementById('prevPair').addEventListener('click', () => {
    const twoColumnView = document.getElementById('twoColumnView');
    if (twoColumnView.style.display !== 'none') {
        if (window.currentIndex > 0) {
            window.currentIndex--;
            updateFileContentsCount();
            displayCurrentPair();
        }
    } else {
        if (window.currentIndex > 0) {
            window.currentIndex--;
            updateFileContentsCount();
            displayCurrentFile();
        }
    }
});

function updateNavigationButtons() {
    const prevButton = document.getElementById('prevPair');
    const nextButton = document.getElementById('nextPair');
    const twoColumnView = document.getElementById('twoColumnView');
    
    if (twoColumnView.style.display !== 'none') {
        prevButton.disabled = !fileContents.length || window.currentIndex === 0;
        nextButton.disabled = !fileContents.length || window.currentIndex >= fileContents.length - 2;
    } else {
        prevButton.disabled = !fileContents.length || window.currentIndex === 0;
        nextButton.disabled = !fileContents.length || window.currentIndex >= fileContents.length - 1;
    }
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

function createEmptyFile() {
    file = {
        name: 'Code',
        description: '',
        feedback: '',
        error: '',
        metadata: {
            prompt: '',
            raw_response: ''
        },
        solution: ''
    };
    return file;
}

function displayCurrentPair() {
    file1 = fileContents[window.currentIndex];
    file2 = fileContents[window.currentIndex + 1];

    // if file is empty, create a dummy file
    if (!file1) {
        file1 = createEmptyFile();
    }
    if (!file2) {
        file2 = createEmptyFile();
    }
    
    document.getElementById('file1Header').textContent = file1.name;
    document.getElementById('file2Header').textContent = file2.name;
    document.getElementById('file1Desc').innerHTML = marked.parse(file1.description);
    document.getElementById('file2Desc').innerHTML = marked.parse(file2.description);
    errer_str = file1.error ? `\n#### Error \n\`\`\`bash${file1.error}\`\`\`` : '';
    document.getElementById('file1Feedback').innerHTML = marked.parse(`${file1.feedback}${errer_str}`);
    errer_str = file2.error ? `\n#### Error \n\`\`\`bash${file2.error}\`\`\`` : '';
    document.getElementById('file2Feedback').innerHTML = marked.parse(`${file2.feedback}${errer_str}`);
    document.getElementById('file1Prompt').innerHTML = marked.parse(file1.metadata.prompt);
    document.getElementById('file2Prompt').innerHTML = marked.parse(file2.metadata.prompt);
    document.getElementById('file1RawResponse').innerHTML = marked.parse(file1.metadata.raw_response);
    document.getElementById('file2RawResponse').innerHTML = marked.parse(file2.metadata.raw_response);
    compareContents(file1.solution, file2.solution);
    updateNavigationButtons();
    setTimeout(setEqualHeight, 0); // Set equal height after displaying the current pair
}

function displayCurrentFile() {
    file = fileContents[window.currentIndex];
    if (!file) {
        file = createEmptyFile();
    }

    document.getElementById('fileHeader').textContent = file.name;
    document.getElementById('fileDesc').innerHTML = marked.parse(file.description);
    errer_str = file.error ? `\n#### Error \n\`\`\`bash${file.error}\`\`\`` : '';
    document.getElementById('fileFeedback').innerHTML = marked.parse(`${file.feedback}${errer_str}`);
    document.getElementById('filePrompt').innerHTML = marked.parse(file.metadata.prompt);
    document.getElementById('fileRawResponse').innerHTML = marked.parse(file.metadata.raw_response);
    const fileOutput = document.getElementById('fileOutput');
    fileOutput.textContent = file.solution;
    fileOutput.className = `language-${file.language || getFileLanguage(file.name)}`;
    Prism.highlightElement(fileOutput);
    updateNavigationButtons();
}

//=======================================================
// Code Content
//=======================================================

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
    const file1Output = document.getElementById('file1Output').querySelector('code');
    const file2Output = document.getElementById('file2Output').querySelector('code');
    
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

function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function getFileLanguage(fileName) {
    const extension = fileName.split('.').pop();
    switch (extension) {
        case 'java':
            return 'java';
        case 'js':
            return 'javascript';
        case 'py':
            return 'python';
        default:
            return 'plaintext';
    }
}

//=======================================================
// Filter functions
//=======================================================

function populateFilterOptions() {
    const experimentFilter = document.getElementById('experimentFilter');
    const errorTypeFilter = document.getElementById('errorTypeFilter');
    const modelFilter = document.getElementById('modelFilter');
    const problemFilter = document.getElementById('problemFilter');
    const tagsFilterMenu = document.getElementById('tagsFilterMenu');

    const errorTypes = new Set();
    const models = new Set();
    const problems = new Set();
    const experiments = new Map();
    const tags = new Set();

    Object.values(fileContentMap).forEach(content => {
        if (content.metadata.error_type) errorTypes.add(content.metadata.error_type);
        if (content.metadata.model) models.add(content.metadata.model);
        if (content.metadata.problem) problems.add(content.metadata.problem);
        if (content.metadata.tags) content.metadata.tags.forEach(tag => tags.add(tag));
    });

    Object.keys(experimentMap).forEach(id => {
        const experiment = experimentMap[id];
        experiments.set(id, experiment.name);
    });

    // Clear existing options and add default option
    errorTypeFilter.innerHTML = '';
    errorTypeFilter.appendChild(new Option('Select Error Type', ''));
    errorTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        errorTypeFilter.appendChild(option);
    });

    modelFilter.innerHTML = '';
    modelFilter.appendChild(new Option('Select Model', ''));
    models.forEach(model => {
        const option = document.createElement('option');
        option.value = model;
        option.textContent = model;
        modelFilter.appendChild(option);
    });

    problemFilter.innerHTML = '';
    problemFilter.appendChild(new Option('Select Problem', ''));
    problems.forEach(problem => {
        const option = document.createElement('option');
        option.value = problem;
        option.textContent = problem;
        problemFilter.appendChild(option);
    });

    experimentFilter.innerHTML = '';
    experimentFilter.appendChild(new Option('Select Experiment', ''));
    experiments.forEach((name, id) => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = name;
        experimentFilter.appendChild(option);
    });

    tagsFilterMenu.innerHTML = '';
    sorted_tags = Array.from(tags).sort(Intl.Collator().compare);
    sorted_tags.forEach(tag => {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = tag;
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(tag));
        tagsFilterMenu.appendChild(label);
    });
}

function applyFilters() {
    const errorType = document.getElementById('errorTypeFilter').value;
    const model = document.getElementById('modelFilter').value;
    const problem = document.getElementById('problemFilter').value;
    const tags = Array.from(document.querySelectorAll('#tagsFilterMenu input:checked')).map(input => input.value);
    const experiment_id = document.getElementById('experimentFilter').value;

    // Determine which view to show based on experiment selection
    const twoColumnView = document.getElementById('twoColumnView');
    const oneColumnView = document.getElementById('oneColumnView');
    
    if (experiment_id) {
        // Show two-column view for experiments
        twoColumnView.style.display = 'flex';
        oneColumnView.style.display = 'none';
    } else {
        // Show one-column view when no experiment selected
        twoColumnView.style.display = 'none';
        oneColumnView.style.display = 'flex';
    }

    // Filter content
    filteredContents = [];
    if (experiment_id) {
        const experimentContent = experimentMap[experiment_id];
        const experimentFileIds = experimentContent.id_list;
        filteredContents = experimentFileIds.map(id => fileContentMap[id]);
    } else {
        filteredContents = Object.values(fileContentMap);
    }

    filteredContents = filteredContents.filter(content => {
        const matchesErrorType = !errorType || content.metadata.error_type === errorType;
        const matchesModel = !model || content.metadata.model === model;
        const matchesProblem = !problem || content.metadata.problem === problem;
        // Check if one of tags are present in the content
        const matchesTags = !tags.length || (content.metadata.tags && tags.some(tag => content.metadata.tags.includes(tag)));

        return matchesErrorType && matchesModel && matchesProblem && matchesTags;
    });

    fileContents = filteredContents;
    updateNavigationButtons();
    updateFileContentsCount();
    window.currentIndex = 0;
    
    if (twoColumnView.style.display !== 'none') {
        displayCurrentPair();
    } else {
        displayCurrentFile();
    }
}

function resetFilters() {
    document.getElementById('experimentFilter').value = '';
    document.getElementById('errorTypeFilter').value = '';
    document.getElementById('modelFilter').value = '';
    document.getElementById('problemFilter').value = '';
    document.querySelectorAll('#tagsFilterMenu input:checked').forEach(checkbox => checkbox.checked = false);

    // Reset to one-column view
    document.getElementById('twoColumnView').style.display = 'none';
    document.getElementById('oneColumnView').style.display = 'flex';

    fileContents = Object.values(fileContentMap);
    updateNavigationButtons();
    updateFileContentsCount();
    window.currentIndex = 0;
    displayCurrentFile();
}

function updateFileContentsCount() {
    const countElement = document.getElementById('fileContentsCount');
    countElement.textContent = `Files:${window.currentIndex+1}/${fileContents.length}`;
}

function setEqualHeight() {
    const twoColumnView = document.getElementById('twoColumnView');
    if (twoColumnView.style.display === 'none') return;

    const divPairs = [
        ['file1Desc', 'file2Desc'],
        ['file1Output', 'file2Output'],
        ['file1Feedback', 'file2Feedback'],
        ['file1Prompt', 'file2Prompt'],
        ['file1RawResponse', 'file2RawResponse']
    ];

    divPairs.forEach(pair => {
        const [id1, id2] = pair;
        const div1 = document.getElementById(id1);
        const div2 = document.getElementById(id2);

        // Reset heights to auto to recalculate
        div1.style.height = 'auto';
        div2.style.height = 'auto';

        // setTimeout(() => {
            const maxHeight = Math.max(div1.scrollHeight, div2.scrollHeight);
            div1.style.height = `${maxHeight}px`;
            div2.style.height = `${maxHeight}px`;
            // div1.style.minHeight = `${maxHeight}px`;
            // div2.style.minHeight = `${maxHeight}px`;
        // }, 0);
    });
}

function toggleFold(elementId) {
    const element = document.getElementById(elementId);
    const button = element.previousElementSibling.querySelector('.fold-button');
    const twoColumnView = document.getElementById('twoColumnView');

    if (element.style.display === 'none') {
        element.style.display = 'block';
        button.textContent = '▼';
    } else {
        element.style.display = 'none';
        button.textContent = '►';
    }

    // If in two-column view, fold/unfold the corresponding element in the other column
    if (twoColumnView.style.display !== 'none') {
        otherElementId = elementId.replace('file1', 'file2');
        if (element.id.includes('file2')) {
            otherElementId = elementId.replace('file2', 'file1');
        }
        const otherElement = document.getElementById(otherElementId);
        const otherButton = otherElement.previousElementSibling.querySelector('.fold-button');

        if (element.style.display === 'none') {
            otherElement.style.display = 'none';
            otherButton.textContent = '►';
        } else {
            otherElement.style.display = 'block';
            otherButton.textContent = '▼';
        }
    }
}