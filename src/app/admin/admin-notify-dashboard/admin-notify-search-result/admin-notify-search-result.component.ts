import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { AdminNotifySearchResult } from '../models/admin-notify-message-search-result.model';
import { ViewMode } from '../../../core/shared/view-mode.model';
import { Context } from '../../../core/shared/context.model';
import { AdminNotifyMessage } from '../models/admin-notify-message.model';
import {
  tabulatableObjectsComponent
} from '../../../shared/object-collection/shared/tabulatable-objects/tabulatable-objects.decorator';
import {
  TabulatableResultListElementsComponent
} from '../../../shared/object-list/search-result-list-element/tabulatable-search-result/tabulatable-result-list-elements.component';
import { PaginatedList } from '../../../core/data/paginated-list.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AdminNotifyDetailModalComponent } from '../admin-notify-detail-modal/admin-notify-detail-modal.component';
import { BehaviorSubject, Subscription } from 'rxjs';
import { AdminNotifyMessagesService } from '../services/admin-notify-messages.service';
import { SearchConfigurationService } from '../../../core/shared/search/search-configuration.service';
import { SEARCH_CONFIG_SERVICE } from '../../../my-dspace-page/my-dspace-page.component';
import { DatePipe } from '@angular/common';

@tabulatableObjectsComponent(PaginatedList<AdminNotifySearchResult>, ViewMode.Table, Context.CoarNotify)
@Component({
  selector: 'ds-admin-notify-search-result',
  templateUrl: './admin-notify-search-result.component.html',
  providers: [
    {
      provide: SEARCH_CONFIG_SERVICE,
      useClass: SearchConfigurationService
    }
  ]
})
export class AdminNotifySearchResultComponent extends TabulatableResultListElementsComponent<PaginatedList<AdminNotifySearchResult>, AdminNotifySearchResult> implements OnInit, OnDestroy{
  public messagesSubject$: BehaviorSubject<AdminNotifyMessage[]> = new BehaviorSubject([]);
  public reprocessStatus = 'QUEUE_STATUS_QUEUED_FOR_RETRY';
  //we check on one type of config to render specific table headers
  public isInbound: boolean;


  /**
   * Array to track all subscriptions and unsubscribe them onDestroy
   * @type {Array}
   */
  private subs: Subscription[] = [];

  /**
   * Keys to be formatted as date
   * @private
   */

  private dateTypeKeys: string[] = ['queueLastStartTime', 'queueTimeout'];

  /**
   * Keys to be not shown in detail
   * @private
   */
  private hiddenKeys: string[] = [
    'target',
    'object',
    'context',
    'origin',
    '_links',
    'metadata',
    'thumbnail',
    'item',
    'accessStatus',
    'queueStatus',
    'notificationId',
    'notificationType',
    'message'
  ];

  /**
   * The format for the date values
   * @private
   */
  private dateFormat = 'YYYY/MM/d hh:mm:ss';

    constructor(private modalService: NgbModal,
                private adminNotifyMessagesService: AdminNotifyMessagesService,
                private datePipe: DatePipe,
                @Inject(SEARCH_CONFIG_SERVICE) public searchConfigService: SearchConfigurationService) {
      super();
    }

  /**
   * Map messages on init for readable representation
   */
  ngOnInit() {
    this.mapDetailsToMessages();
    this.subs.push(this.searchConfigService.getCurrentConfiguration('')
      .subscribe(configuration => {
        this.isInbound = configuration.startsWith('NOTIFY.incoming');
      })
    );
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  /**
   * Open modal for details visualization
   * @param message the message to be displayed
   */
  openDetailModal(notifyMessage: AdminNotifyMessage) {
    const modalRef = this.modalService.open(AdminNotifyDetailModalComponent);
    const messageToOpen = {...notifyMessage};
    // we exclude not necessary or not readable keys
    const messageKeys = Object.keys(messageToOpen).filter(key => !this.hiddenKeys.includes(key));

    messageKeys.forEach(key => {
      if (this.dateTypeKeys.includes(key)) {
        messageToOpen[key] = this.datePipe.transform(messageToOpen[key], this.dateFormat);
      }
    });
    // format COAR message for technical visualization
    messageToOpen.message = JSON.stringify(JSON.parse(notifyMessage.message), null, 2);

    modalRef.componentInstance.notifyMessage = messageToOpen;
    modalRef.componentInstance.notifyMessageKeys = messageKeys;
  }

  /**
   * Reprocess message in status QUEUE_STATUS_QUEUED_FOR_RETRY and update results
   * @param message the message to be reprocessed
   */
  reprocessMessage(message: AdminNotifyMessage) {
    this.subs.push(
      this.adminNotifyMessagesService.reprocessMessage(message, this.messagesSubject$)
        .subscribe(response => {
          this.messagesSubject$.next(response);
        }
      )
    );
  }


  /**
   * Map readable results to messages
   * @private
   */
  private mapDetailsToMessages() {
    this.subs.push(this.adminNotifyMessagesService.getDetailedMessages(this.objects?.page.map(pageResult => pageResult.indexableObject))
      .subscribe(response => {
        this.messagesSubject$.next(response);
    }));
  }
}
