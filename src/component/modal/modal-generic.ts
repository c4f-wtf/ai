import { html, TemplateResult } from 'lit-element';
import appStore from '@store/app-store';
import { LazyElement } from '@element/lazy-element';
import { ModalAbort } from '@element/c4f-modal';
import { ModalTemplate } from '@modal/templates';

// @ts-ignore
import sharedStyles from '@shared-styles';
// @ts-ignore
import style from './modal-generic.css';

class ModalGeneric extends LazyElement {
    data: ModalTemplate;
    _error: TemplateResult | null;

    static get properties() {
        return {
            ...super.properties,
            template: { type: Object, hasChanged: () => true },
            _error: {type: String },
        }
    }

    static get styles() {
        return [
            sharedStyles,
            style,
        ];
    }

    render() {
        if(this.data){
            return html`
                <form autocomplete="off" action="javascript:void(0);">
                    <header>
                        <h1>${this.data.title}</h1>
                    </header>
                    <ul>
                        ${this.data.content}
                        ${this._error}
                    </ul>
                    <footer>
                        <button id="no" class="error" @click=${this.onAbort}>${this.data.abort}</button>
                        <button id="yes" class="ok" @click=${this.onSubmit}>${this.data.submit}</button>
                    </footer>
                </form>
            `;
        }
        else{
            return html``;
        }
    }

    updated(){
        if(this.shadowRoot){
            if(this.data && this.data.init){
                this.data.init(this.shadowRoot);
            }
            const firstElement = this.shadowRoot.querySelector('input,select') as HTMLElement;
            if(firstElement)
                firstElement.focus();
            if(this.data && this.data.change){
                for(let [field, callback] of Object.entries(this.data.change)){
                    const element = this.shadowRoot.getElementById(field);
                    element?.addEventListener('change', e => callback(e, this.shadowRoot));
                }
            }
        }
        
    }

    async onSubmit(){
        try{
            const fields: {[key:string]: any} = {};
            const elements = this.shadowRoot?.querySelectorAll('input,select');
            if(elements){
                elements.forEach(element => {
                    const input = element as HTMLInputElement;
                    switch(input.type){
                        case 'checkbox':
                            fields[input.id] = input.checked;
                            break;
                        case 'file':
                            fields[input.id] = input.files;
                            break;
                        default:
                            fields[input.id] = input.value;
                    }
                })
                if(this.data.check){
                    const error = await this.data.check(fields);
                    if(error instanceof Error)
                        throw error;
                }

                this._error = null;
                appStore.resolveModal(fields);
            }
        }
        catch(error){
            this._error = html`<li class="error"><p>${error}</p></li>`;
        }
    }

    onAbort(){
        this._error = null;
        appStore.rejectModal(new ModalAbort());
    }

    onKeyDown(key: string){
        switch(key){
            case 'Escape': this.onAbort(); break;
            case 'Enter': this.onSubmit(); break;
        }
    }
}

window.customElements.define('modal-generic', ModalGeneric);
