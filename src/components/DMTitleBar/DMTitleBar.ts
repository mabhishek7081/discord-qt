import { QWidget, QLabel, QPixmap, QSize } from '@nodegui/nodegui';
import path from 'path';
import { app } from '../..';
import {  DMChannel, Client, Channel, TextChannel } from 'discord.js';
import './DMTitleBar.scss';
import { DTitleBar } from '../DTitleBar/DTitleBar';
import { DLineEdit } from '../DLineEdit/DLineEdit';
import { DIconButton } from '../DIconButton/DIconButton';
import { ViewOptions } from '../../views/ViewOptions';

const PresenceStatusColor = new Map([
  ['online', '#43b581'],
  ['dnd', '#f04747'],
  ['idle', '#faa61a'],
  ['offline', 'rgb(116, 127, 141)']
])

export class MainTitleBar extends DTitleBar {
  private channel?: TextChannel | DMChannel;
  private userNameLabel = new QLabel();
  private statusLabel = new QLabel();
  private nicknamesBar = new QWidget();
  private iconLabel = new QLabel();
  private atPixmap = new QPixmap(path.join(__dirname, './assets/icons/at.png'));
  private poundPixmap = new QPixmap(path.join(__dirname, './assets/icons/pound.png'));

  constructor() {
    super();

    this.setInlineStyle('background-color: #36393f');
    this.initComponent();
    app.on('switchView', (view: string, options?: ViewOptions) => {
      if(!['dm', 'guild'].includes(view) || !options) return;
      if(options.dm) this.handleDMOpen(options.dm);
      else if (options.channel) this.handleGuildOpen(options.channel)
    });
    app.on('client', (client: Client) => {
      /*
      client.on('userUpdate', (before, after) => {
        console.log(after.username);
        if(this.channel?.recipient.id === after.id) 
          this.updateStatus();
      })
      */
    })
    setInterval(() => this.raise(), 100);
  }

  private initComponent() {
    const { userNameLabel, statusLabel, nicknamesBar, controls: layout, iconLabel } = this;

    layout.setSpacing(6);
    layout.setContentsMargins(16, 12, 16, 12)

    userNameLabel.setObjectName('UserNameLabel');
    statusLabel.setObjectName('StatusLabel');
    nicknamesBar.setObjectName('NicknamesBar');

    const searchEdit = new DLineEdit();
    searchEdit.setInlineStyle('width: 136px; height: 24px; margin-left: 4px; margin-right: 4px;');
    searchEdit.setPlaceholderText('Search');

    const pinBtn = new DIconButton({
      iconPath: path.join(__dirname, './assets/icons/pin.png'),
      iconQSize: new QSize(24, 24),
      tooltipText: 'Pinned Messages'
    });

    const helpBtn = new DIconButton({
      iconPath: path.join(__dirname, './assets/icons/help-circle.png'),
      iconQSize: new QSize(24, 24),
      tooltipText: 'Help'
    });

    layout.addWidget(iconLabel);
    layout.addWidget(userNameLabel);
    layout.addWidget(statusLabel);
    layout.addWidget(nicknamesBar, 1);
    layout.addWidget(pinBtn);
    layout.addWidget(searchEdit);
    layout.addWidget(helpBtn);
  }

  private updateStatus() {
    const { channel, statusLabel } = this;
    if(channel instanceof TextChannel) return;
    statusLabel.setText(channel?.recipient.presence.status || "");
    statusLabel.setInlineStyle(`color: ${PresenceStatusColor.get(channel?.recipient.presence.status || 'offline')}`);
  }

  private handleDMOpen(channel: DMChannel) {
    const { userNameLabel, statusLabel, iconLabel, atPixmap } = this;
    this.channel = channel;
    iconLabel.setPixmap(atPixmap);
    userNameLabel.setText(channel.recipient.username);
    statusLabel.show();
    this.updateStatus();
  }

  private handleGuildOpen(channel: TextChannel) {
    const { userNameLabel, statusLabel, iconLabel, poundPixmap } = this;
    this.channel = channel;
    iconLabel.setPixmap(poundPixmap);
    userNameLabel.setText(channel.name);
    statusLabel.hide();
    this.updateStatus();
  }
}