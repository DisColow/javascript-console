document.addEventListener('DOMContentLoaded', () => {
    const editor = ace.edit("editor");
    ace.require("ace/ext/language_tools");
    editor.setTheme("ace/theme/monokai");
    editor.session.setMode("ace/mode/javascript");
    editor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true
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
});