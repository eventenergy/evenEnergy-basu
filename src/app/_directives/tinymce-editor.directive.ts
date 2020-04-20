import { OnInit, Directive, ElementRef, Renderer2, Output, EventEmitter, Input, OnChanges } from '@angular/core';
declare var tinymce: any;

@Directive({
  selector: '[appTinymceEditor]'
})
export class TinymceEditorDirective implements OnChanges, OnInit {
  ngOnInit(): void {
    var storyTitleEditorSettings: any = {
      inline: true,
      target: this.elem.nativeElement,
      base_url: '/tinymce',
      suffix: '.min',
      menubar: false,
      paste_as_text: true,
      plugins: 'wordcount paste',
      toolbar: "fontselect | forecolor | bold italic backcolor",
      forced_root_block: 'p',
      setup: function (editor) {
        //disable enter key
        editor.on('keydown', function (e) {
          if (e.keyCode == 13) {
            e.preventDefault();
          }
        })
      },
    };

    var storyContentEditorSettings: any = {
      // fixed_toolbar_container: '#tinyToolBar',
      inline: true,
      target: this.elem.nativeElement,
      base_url: '/tinymce',
      suffix: '.min',
      height: 500,
      statusbar: false,
      menubar: false,
      plugins: [
        'wordcount', 'lists'
      ],
      toolbar: ['insert | undo redo |  formatselect | bold italic backcolor',
      'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat ',
      'fontselect'
    ],
    }
    if(this.isTitle) tinymce.init(storyTitleEditorSettings)
    else tinymce.init(storyContentEditorSettings);
    
    this._currentEditor = tinymce.activeEditor;
    // listen when the user exits the editor to emit current data
    this.renderer.listen(this.elem.nativeElement, "focusout", () => {
      if (this._currentEditor.plugins.wordcount.body.getWordCount() > 0) {
          this.newText.emit(this._currentEditor.getContent());
      }
      else {
        setTimeout(() => {
          this._currentEditor.setContent('This field is required');
        }, 20);
        this.newText.emit(null);
      }
    })
    this.renderer.listen(this.elem.nativeElement, "focus", () => {
      if(this.isPlaceholder){
        setTimeout(() => {
          this._currentEditor.setContent('');
        }, 20);
      }
      //this is to reset invalid condition(if its invalid) once the editor is in focus
      //TODO have a better implementation for this
      this.newText.emit('a');
    })
    
  }
  //set content for the very first time this editor is loaded, on subsequent changes, the directive emits current value
  ngOnChanges(changes: import("@angular/core").SimpleChanges): void {
    if (changes.initialContent.firstChange) {
      this._defaultText = this.initialContent;
      this.elem.nativeElement.innerHTML = changes.initialContent.currentValue;
      this._contentPresent = true;
    }
  }
  @Input() initialContent: string;
  @Input() isPlaceholder: boolean;
  @Input() isTitle: boolean;
  @Output() newText: EventEmitter<string> = new EventEmitter();
  _defaultText: string;
  _contentPresent: boolean = false;
  _currentEditor: any;
  constructor(private elem: ElementRef, private renderer: Renderer2) {
    
  }
}
