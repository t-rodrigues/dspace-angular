// Load the implementations that should be tested
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import {
  ComponentFixture,
  inject,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormGroup,
} from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {
  DynamicFormControlLayout,
  DynamicFormLayoutService,
  DynamicFormsCoreModule,
  DynamicFormValidationService,
} from '@ng-dynamic-forms/core';
import { DynamicFormsNGBootstrapUIModule } from '@ng-dynamic-forms/ui-ng-bootstrap';

import { ConfigurationDataService } from '../../../../../../core/data/configuration-data.service';
import { ConfigurationProperty } from '../../../../../../core/shared/configuration-property.model';
import { VocabularyEntry } from '../../../../../../core/submission/vocabularies/models/vocabulary-entry.model';
import { VocabularyOptions } from '../../../../../../core/submission/vocabularies/models/vocabulary-options.model';
import { VocabularyService } from '../../../../../../core/submission/vocabularies/vocabulary.service';
import { createSuccessfulRemoteDataObject$ } from '../../../../../remote-data.utils';
import {
  mockDynamicFormLayoutService,
  mockDynamicFormValidationService,
} from '../../../../../testing/dynamic-form-mock-services';
import { createTestComponent } from '../../../../../testing/utils.test';
import { VocabularyServiceStub } from '../../../../../testing/vocabulary-service.stub';
import { FormBuilderService } from '../../../form-builder.service';
import { DsDynamicListComponent } from './dynamic-list.component';
import { DynamicListCheckboxGroupModel } from './dynamic-list-checkbox-group.model';
import { DynamicListRadioGroupModel } from './dynamic-list-radio-group.model';

export const LAYOUT_TEST = {
  element: {
    group: '',
  },
} as DynamicFormControlLayout;

export const LIST_CHECKBOX_TEST_MODEL_CONFIG = {
  vocabularyOptions: {
    name: 'type_programme',
    closed: false,
  } as VocabularyOptions,
  disabled: false,
  id: 'listCheckbox',
  label: 'Programme',
  name: 'listCheckbox',
  placeholder: 'Programme',
  readOnly: false,
  required: false,
  repeatable: true,
};

export const LIST_RADIO_TEST_MODEL_CONFIG = {
  vocabularyOptions: {
    name: 'type_programme',
    closed: false,
  } as VocabularyOptions,
  disabled: false,
  id: 'listRadio',
  label: 'Programme',
  name: 'listRadio',
  placeholder: 'Programme',
  readOnly: false,
  required: false,
  repeatable: false,
};

describe('DsDynamicListComponent test suite', () => {

  let testComp: TestComponent;
  let listComp: DsDynamicListComponent;
  let testFixture: ComponentFixture<TestComponent>;
  let listFixture: ComponentFixture<DsDynamicListComponent>;
  let html;
  let modelValue;

  const vocabularyServiceStub = new VocabularyServiceStub();

  const configurationDataService = jasmine.createSpyObj('configurationDataService', {
    findByPropertyName: createSuccessfulRemoteDataObject$(Object.assign(new ConfigurationProperty(), {
      name: 'test',
      values: [
        'org.dspace.ctask.general.ProfileFormats = test',
      ],
    })),
  });

  // waitForAsync beforeEach
  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      imports: [
        DynamicFormsCoreModule,
        DynamicFormsNGBootstrapUIModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        DsDynamicListComponent,
        TestComponent,
      ],
      providers: [
        ChangeDetectorRef,
        DsDynamicListComponent,
        DynamicFormValidationService,
        FormBuilderService,
        { provide: VocabularyService, useValue: vocabularyServiceStub },
        { provide: DynamicFormLayoutService, useValue: mockDynamicFormLayoutService },
        { provide: DynamicFormValidationService, useValue: mockDynamicFormValidationService },
        { provide: ConfigurationDataService, useValue: configurationDataService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

  }));

  describe('', () => {
    // synchronous beforeEach
    beforeEach(() => {
      html = `
      <ds-dynamic-list
        [bindId]="bindId"
        [group]="group"
        [model]="model"
        (blur)="onBlur($event)"
        (change)="onValueChange($event)"
        (focus)="onFocus($event)"></ds-dynamic-list>`;

      testFixture = createTestComponent(html, TestComponent) as ComponentFixture<TestComponent>;
      testComp = testFixture.componentInstance;
    });

    afterEach(() => {
      testFixture.destroy();
      testComp = null;
    });

    it('should create DsDynamicListComponent', inject([DsDynamicListComponent], (app: DsDynamicListComponent) => {

      expect(app).toBeDefined();
    }));
  });

  describe('when model is a DynamicListCheckboxGroupModel', () => {
    describe('and init model value is empty', () => {
      beforeEach(() => {

        listFixture = TestBed.createComponent(DsDynamicListComponent);
        listComp = listFixture.componentInstance; // FormComponent test instance
        listComp.group = new UntypedFormGroup({
          listCheckbox: new UntypedFormGroup({}),
          listRadio: new UntypedFormGroup({}),
        });
        listComp.model = new DynamicListCheckboxGroupModel(LIST_CHECKBOX_TEST_MODEL_CONFIG, LAYOUT_TEST);
        listFixture.detectChanges();
      });

      afterEach(() => {
        listFixture.destroy();
        listComp = null;
      });

      it('should init component properly', () => {
        expect((listComp as any).optionsList).toEqual(vocabularyServiceStub.getList());
        expect(listComp.items.length).toBe(1);
        expect(listComp.items[0].length).toBe(2);
      });

      it('should set model value properly when a checkbox option is selected', () => {
        const de = listFixture.debugElement.queryAll(By.css('div.form-check'));
        const items = de[0].queryAll(By.css('input.form-check-input'));
        const item = items[0];
        modelValue = [Object.assign(new VocabularyEntry(), { authority: 1, display: 'one', value: 1 })];

        item.nativeElement.click();

        expect(listComp.model.value).toEqual(modelValue);
      });

      it('should emit blur Event onBlur', () => {
        spyOn(listComp.blur, 'emit');
        listComp.onBlur(new Event('blur'));
        expect(listComp.blur.emit).toHaveBeenCalled();
      });

      it('should emit focus Event onFocus', () => {
        spyOn(listComp.focus, 'emit');
        listComp.onFocus(new Event('focus'));
        expect(listComp.focus.emit).toHaveBeenCalled();
      });
    });

    describe('and init model value is not empty', () => {
      beforeEach(() => {

        listFixture = TestBed.createComponent(DsDynamicListComponent);
        listComp = listFixture.componentInstance; // FormComponent test instance
        listComp.group = new UntypedFormGroup({
          listCheckbox: new UntypedFormGroup({}),
          listRadio: new UntypedFormGroup({}),
        });
        listComp.model = new DynamicListCheckboxGroupModel(LIST_CHECKBOX_TEST_MODEL_CONFIG, LAYOUT_TEST);
        modelValue = [Object.assign(new VocabularyEntry(), { authority: 1, display: 'one', value: 1 })];
        listComp.model.value = modelValue;
        listFixture.detectChanges();
      });

      afterEach(() => {
        listFixture.destroy();
        listComp = null;
      });

      it('should init component properly', () => {
        expect((listComp as any).optionsList).toEqual(vocabularyServiceStub.getList());
        expect(listComp.model.value).toEqual(modelValue);
        expect((listComp.model as DynamicListCheckboxGroupModel).group[0].value).toBeTruthy();
      });

      it('should set model value properly when a checkbox option is deselected', () => {
        const de = listFixture.debugElement.queryAll(By.css('div.form-check'));
        const items = de[0].queryAll(By.css('input.form-check-input'));
        const item = items[0];
        modelValue = [];

        item.nativeElement.click();

        expect(listComp.model.value).toEqual(modelValue);
      });
    });
  });

  describe('when model is a DynamicListRadioGroupModel', () => {
    describe('and init model value is empty', () => {
      beforeEach(() => {

        listFixture = TestBed.createComponent(DsDynamicListComponent);
        listComp = listFixture.componentInstance; // FormComponent test instance
        listComp.group = new UntypedFormGroup({
          listCheckbox: new UntypedFormGroup({}),
          listRadio: new UntypedFormGroup({}),
        });
        listComp.model = new DynamicListRadioGroupModel(LIST_RADIO_TEST_MODEL_CONFIG, LAYOUT_TEST);
        listFixture.detectChanges();
      });

      afterEach(() => {
        listFixture.destroy();
        listComp = null;
      });

      it('should init component properly', () => {
        expect((listComp as any).optionsList).toEqual(vocabularyServiceStub.getList());
        expect(listComp.items.length).toBe(1);
        expect(listComp.items[0].length).toBe(2);
      });

      it('should set model value when a radio option is selected', () => {
        const de = listFixture.debugElement.queryAll(By.css('div.form-check'));
        const items = de[0].queryAll(By.css('input.form-check-input'));
        const item = items[0];
        modelValue = Object.assign(new VocabularyEntry(), { authority: 1, display: 'one', value: 1 });

        item.nativeElement.click();

        expect(listComp.model.value).toEqual(modelValue);
      });
    });

    describe('and init model value is not empty', () => {
      beforeEach(() => {

        listFixture = TestBed.createComponent(DsDynamicListComponent);
        listComp = listFixture.componentInstance; // FormComponent test instance
        listComp.group = new UntypedFormGroup({
          listCheckbox: new UntypedFormGroup({}),
          listRadio: new UntypedFormGroup({}),
        });
        listComp.model = new DynamicListRadioGroupModel(LIST_RADIO_TEST_MODEL_CONFIG, LAYOUT_TEST);
        modelValue = Object.assign(new VocabularyEntry(), { authority: 1, display: 'one', value: 1 });
        listComp.model.value = modelValue;
        listFixture.detectChanges();
      });

      afterEach(() => {
        listFixture.destroy();
        listComp = null;
      });

      it('should init component properly', () => {
        expect((listComp as any).optionsList).toEqual(vocabularyServiceStub.getList());
        expect(listComp.model.value).toEqual(modelValue);
        expect((listComp.model as DynamicListRadioGroupModel).options[0].value).toBeTruthy();
      });
    });
  });
});

// declare a test component
@Component({
  selector: 'ds-test-cmp',
  template: ``,
  standalone: true,
  imports: [
    DsDynamicListComponent,
  ],
})
class TestComponent {

  group: UntypedFormGroup = new UntypedFormGroup({
    listCheckbox: new UntypedFormGroup({}),
    listRadio: new UntypedFormGroup({}),
  });

  model = new DynamicListCheckboxGroupModel(LIST_CHECKBOX_TEST_MODEL_CONFIG, LAYOUT_TEST);

  showErrorMessages = false;

}
