// ============================================================================
// Davis Base - Component
//
// This component creates Davis landing page
// ============================================================================

// ----------------------------------------------------------------------------
// Imports
// ----------------------------------------------------------------------------
// Angular
import { Component, OnInit, 
         AfterViewInit,
         ElementRef,
         Renderer,
         ViewChild }              from '@angular/core';
import { Router }                 from '@angular/router';
import { ConfigService }          from '../../shared/config/config.service';
import { DavisService }           from '../../shared/davis.service';
import * as _                     from 'lodash';

// ----------------------------------------------------------------------------
// Class
// ----------------------------------------------------------------------------
@Component({
  selector:    'davis-base',
  templateUrl: './davis-base.component.html',
})

export class DavisBaseComponent implements OnInit, AfterViewInit {
  
  @ViewChild('davisIn') davisIn: ElementRef;
  
  davisInput: string = '';
  davisOutput: string = '';
  davisMode: any;
  modes: any = {
    listening: {
      title: 'Listening...',
      name: 'listening'
    },
    processing: {
      title: 'Processing...',
      name: 'processing'
    },
    sleeping: {
      title: 'Say "Hey davis" to wake me',
      name: 'sleeping'
    },
    silent: {
      title: 'Launch phrase disabled, click mic to wake me',
      name: 'silent'
    },
    chat: {
      title: 'Chat',
      name: 'chat'
    },
    noMic: {
      // title: 'Chat - No mic detected',
      title: 'Chat',
      name: 'noMic'
    }
  };
  placeholder: string = 'Did anything happen last night?';
  isDavisInputFocused: boolean = false;
  isDavisListening: boolean = false;
  showProcessingIndicator: boolean = false;
  
  // ------------------------------------------------------
  // Inject services
  // ------------------------------------------------------
  constructor(
    private renderer: Renderer,
    public router: Router, 
    public iConfig: ConfigService, 
    public iDavis: DavisService) { }

  // ------------------------------------------------------
  // Initialize component
  // ------------------------------------------------------
  
  doSubmit() {
    let phrase = this.iDavis.safariAutoCompletePolyFill(this.davisInput, 'davisInput').trim();
    if (phrase.length > 0) {
      this.addToConvo( { visual: { card: { text: phrase } } }, false);
      this.iDavis.windowScrollBottom('slow');
      this.davisInput = '';
      this.showProcessingIndicator = true;
      setTimeout(() => {
        this.iDavis.windowScrollBottom('slow');
      }, 200);
      this.iDavis.askDavisPhrase(phrase)
        .then(response => {
          if (!response.success) throw new Error(response.response);
          if (response.response.visual.card) {
            response.response.visual.card.attachments.forEach((attachment: any, index: any) => {
              if (attachment.actions) {
                response.response.visual.card.attachments[index].actionClicked = null;
                response.response.visual.card.attachments.push(response.response.visual.card.attachments[index]);
                response.response.visual.card.attachments.splice(index, 1);
              }
            });
          }
          if (response.response.visual.card || response.response.visual.card.text) {
            this.addToConvo(response.response, true);
            this.iDavis.blurDavisInput();
            setTimeout(() => {
              this.iDavis.windowScrollBottom('slow');
            }, 100);
          }
        })
        .catch(err => {
          if (typeof err !== 'string' && err.message) err = err.message;
          this.addToConvo( { visual: { card: { text: err, error: true } }}, true);
          this.iDavis.windowScrollBottom('slow');
        });
    } else {
      this.davisInput = '';
    }
  }
  
  addToConvo(message: any, isDavis: boolean) {
    message.isDavis = isDavis;
    message.timestamp = this.iDavis.getTimestamp();
    this.showProcessingIndicator = false;
    this.iDavis.conversation.push(message);
  }
  
  toggleListening(isListening: boolean) {
    this.isDavisListening = isListening;
    
    if (this.davisMode !== this.modes.noMic) {
      if (this.isDavisListening && !this.isDavisInputFocused) {
        this.davisMode = this.modes.listening;
      } else if (this.isDavisInputFocused) {
        this.davisMode = this.modes.chat; 
      } else {
        this.davisMode = this.modes.silent;
      }
    }
  }
  
  ngOnInit() {
    this.iDavis.isBreadcrumbsVisible = true;
    this.davisMode = this.modes.noMic;
    this.iDavis.focusDavisInputOnKeyDown();
    
    if (!this.iDavis.values.user.email || !this.iDavis.davisVersion) {
      this.iDavis.getDavisUser()
        .then(response => {
          if (!response.success) throw new Error(response.message); 
          this.iDavis.values.user = response.user;
          
          // Backwards compatibility, was once optional
          if (!response.user.name) {
            this.iDavis.values.user.name = { first: '', last: '' };
          } else {
            if (!response.user.name.first) this.iDavis.values.user.name.first = '';
            if (!response.user.name.last) this.iDavis.values.user.name.last = '';
          }
          this.iConfig.values.original.user = _.cloneDeep(this.iDavis.values.user);
          return this.iDavis.getDavisVersion();
        })
        .then(response => {
          if (!response.success) { 
            throw new Error(response.message); 
          }
          this.iDavis.davisVersion = response.version;
        })
        .catch(err => {
          this.iConfig.displayError(err, null);
        });
    }
  }
  
  ngAfterViewInit() {
    if (this.davisMode.name === 'noMic') this.renderer.invokeElementMethod(this.davisIn.nativeElement, 'focus');
    if (this.iDavis.conversation.length > 0) {
      this.iDavis.windowScrollBottom(1);
    }
  }
}
