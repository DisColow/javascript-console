document.addEventListener('DOMContentLoaded', () => {
    const editor = ace.edit("editor");
    const beautify = ace.require("ace/ext/beautify");
    ace.require("ace/ext/language_tools");
    editor.setTheme("ace/theme/monokai");
    editor.session.setMode("ace/mode/javascript");
    editor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true
    });

    const savedCode = localStorage.getItem('javascript-console-code');
    if (savedCode) {
        editor.setValue(savedCode, 1);
    }

    const statusIndicator = document.getElementById('status-indicator');
    let saveTimeout;

    editor.on('change', () => {
        localStorage.setItem('javascript-console-code', editor.getValue());
        statusIndicator.textContent = 'Code saved.';
        statusIndicator.classList.add('visible');

        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            statusIndicator.classList.remove('visible');
        }, 2000);
    });

    const output = document.getElementById('output');
    const originalLog = console.log;

    console.log = function(...args) {
        output.textContent += args.join(' ') + '\n';
        originalLog.apply(console, args);
    };

    editor.commands.addCommand({
        name: 'runCode',
        bindKey: {win: 'Ctrl-Enter',  mac: 'Command-Enter'},
        exec: function(editor) {
            output.textContent = '';
            try {
                const code = editor.getValue();
                const result = (0, eval)(code);
                if (result !== undefined) {
                    let displayValue;
                    if (typeof result === 'function') {
                        displayValue = result.toString();
                    } else {
                        displayValue = JSON.stringify(result, null, 2);
                    }
                    output.textContent += displayValue + '\n';
                }
            } catch (e) {
                output.textContent = e.toString();
            }
        },
        readOnly: true
    });

    const formatButton = document.getElementById('format-button');
    formatButton.addEventListener('click', () => {
        beautify.beautify(editor.session);
    });

    editor.commands.addCommand({
        name: "formatCode",
        bindKey: {win: "Ctrl-Shift-F", mac: "Command-Shift-F"},
        exec: function (editor) {
            beautify.beautify(editor.session);
        }
    });

    const wrapButton = document.getElementById('wrap-button');
    let isWrapEnabled = false;

    const updateWrapButton = () => {
        isWrapEnabled = editor.session.getUseWrapMode();
        if (isWrapEnabled) {
            wrapButton.classList.add('active');
        } else {
            wrapButton.classList.remove('active');
        }
    };

    wrapButton.addEventListener('click', () => {
        editor.session.setUseWrapMode(!editor.session.getUseWrapMode());
        updateWrapButton();
    });

    // Initial state
    updateWrapButton();

    const bookmarkletButton = document.getElementById('bookmarklet-button');
    bookmarkletButton.addEventListener('click', () => {
        const code = editor.getValue();
        if (code.trim() === '') {
            statusIndicator.textContent = 'Cannot create an empty bookmarklet.';
            statusIndicator.classList.add('visible');
            setTimeout(() => {
                statusIndicator.classList.remove('visible');
            }, 3000);
            return;
        }

        const bookmarkletCode = `javascript:(function(){${encodeURIComponent(code)}})();`;
        
        const tempLink = document.createElement('a');
        tempLink.href = bookmarkletCode;
        tempLink.innerHTML = prompt('Name', 'Drag me to your bookmarks bar');
        
        output.innerHTML = '';
        output.appendChild(tempLink);

        statusIndicator.textContent = 'Bookmarklet created. Drag the link to your bookmarks bar.';
        statusIndicator.classList.add('visible');
        setTimeout(() => {
            statusIndicator.classList.remove('visible');
        }, 5000);
    });

    const saveButton = document.getElementById('save-button');
    saveButton.addEventListener('click', () => {
        const code = editor.getValue();
        const blob = new Blob([code], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = prompt('Script name', 'script.js');
        a.click();
        URL.revokeObjectURL(url);
    });
});