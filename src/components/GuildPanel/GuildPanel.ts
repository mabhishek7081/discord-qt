import { QWidget, FlexLayout, QBoxLayout, Direction, QLabel, QPushButton, QIcon, QSize, WidgetEventTypes, AlignmentFlag } from "@nodegui/nodegui";
import './GuildPanel.scss';
import { DTitleBar } from '../DTitleBar/DTitleBar';
import { app } from '../..';
import { Guild, TextChannel } from 'discord.js';
import { join } from 'path';
import { ChannelsList } from './ChannelsList';
import { ViewOptions } from '../../views/ViewOptions';

export class GuildPanel extends QWidget {
  private titleBar = new DTitleBar();
  private actionsMenu = new QWidget();
  private guildel = new QLabel();
  private channelsList = new ChannelsList();
  private controls = new QBoxLayout(Direction.TopToBottom);

  constructor() {
    super();

    this.initComponent();
    app.on('switchView', (view: string, options?: ViewOptions) => {
      if (view !== 'guild' || !options) return;
      if (options.guild)
        this.guildel.setText(options.guild.name);
      else if (options.channel) 
        this.guildel.setText(options.channel.guild.name);
    })
  }

  private initComponent() {
    const { titleBar, actionsMenu, channelsList, controls, guildel } = this;
    this.setLayout(controls);
    this.setObjectName('GuildPanel');

    guildel.setObjectName('GuildLabel');
    guildel.setAlignment(AlignmentFlag.AlignVCenter);
    const guildow = new QPushButton();
    const iopen = new QIcon(join(__dirname, './assets/icons/close.png'));
    const iclosed = new QIcon(join(__dirname, './assets/icons/chevron-down.png'));
    guildow.setIconSize(new QSize(24, 24));
    guildow.setIcon(iclosed);
    let show = false;
    titleBar.addEventListener(WidgetEventTypes.MouseButtonPress, () => {
      show = !show;
      show ? actionsMenu.show() : actionsMenu.hide();
      guildow.setIcon(show ? iopen : iclosed);
    });
    guildow.setInlineStyle('background: none; border: none;');
    titleBar.layout?.setContentsMargins(16, 0, 16, 0);
    titleBar.layout?.addWidget(guildel, 1);
    titleBar.layout?.addWidget(guildow);
    titleBar.setMinimumSize(0, 48);
    
    controls.setSpacing(0);
    controls.setContentsMargins(0, 0, 0, 0);

    actionsMenu.hide();

    [titleBar, actionsMenu]
      .forEach(w => controls.addWidget(w));
    controls.addWidget(channelsList, 1);
    titleBar.raise();
  }
}