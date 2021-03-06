import { QWidget, QBoxLayout, Direction, QLabel, QPushButton, QScrollArea, QPixmap, AspectRatioMode, TransformationMode, ToolButtonStyle, QCheckBox, QIcon, QSize, AlignmentFlag, QGraphicsDropShadowEffect, QColor, SizeConstraint, WidgetEventTypes, CursorShape } from "@nodegui/nodegui";
import { Page } from "./Page";
import { DColorButton, DColorButtonColor } from '../../../components/DColorButton/DColorButton';
import { DLineEdit } from '../../../components/DLineEdit/DLineEdit';
import { Divider, SettingsView } from '../SettingsView';
import { app, Account } from '../../..';
import './AccountsPage.scss';
import { join } from 'path';
import { pictureWorker } from '../../../utilities/PictureWorker';
import { Client } from 'discord.js';

export class AccountsPage extends Page {
  title = "Accounts";
  private accountsSection = new QWidget();
  private accountsLayout = new QBoxLayout(Direction.TopToBottom);

  constructor() {
    super();
    this.initPage();
    this.loadAccounts();
  }
  private checkEmpty() {
    const {noAcLbl} = this;
    if (!app.config.accounts.length) {
      this.accountsLayout.insertWidget(0, noAcLbl, 0);
      noAcLbl.show();
    } else {
      noAcLbl.hide();
      this.accountsLayout.removeWidget(noAcLbl);
    }
  }
  noAcLbl = new QLabel();
  private loadAccounts() {
    const {noAcLbl} = this;
    this.layout.removeWidget(this.accountsSection);
    this.accountsSection = new QWidget();
    this.accountsSection.setObjectName('Page');
    this.accountsLayout = new QBoxLayout(Direction.TopToBottom);
    this.accountsLayout.setContentsMargins(0, 0, 0, 0);
    this.accountsLayout.setSpacing(10);
    this.accountsSection.setLayout(this.accountsLayout);
    this.accountsLayout.addStretch(1);

    this.layout.addWidget(this.accountsSection, 1);
    this.checkboxes.length = 0;
    noAcLbl.setAlignment(AlignmentFlag.AlignTop + AlignmentFlag.AlignHCenter);
    noAcLbl.setObjectName('TextLabel');
    noAcLbl.setInlineStyle('font-size: 16px; color: #72767d;');
    noAcLbl.setText('No accounts configured. Wumpus is awaiting your instructions.');
    this.checkEmpty();
    app.config.accounts.forEach(this.processAccount.bind(this));
  }
  checkboxes: QPushButton[] = [];
  private processAccount(account: Account, i = 0) {
    const accWidget = new QWidget(this.accountsSection);
    const layout = new QBoxLayout(Direction.TopToBottom)
    accWidget.setObjectName('Account');
    accWidget.setLayout(layout);
    layout.setContentsMargins(0, 0, 0, 0);
    layout.setSpacing(0);
    const info = new QWidget(accWidget);
    const infoLayout = new QBoxLayout(Direction.LeftToRight);
    infoLayout.setContentsMargins(20, 20, 20, 20);
    infoLayout.setSpacing(0);
    info.setLayout(infoLayout);
    info.setObjectName('Info');

    const avatar = new QLabel(accWidget);
    pictureWorker.loadImage(account.avatar, { roundify: true })
      .then(buffer => {
        if (!buffer) return;
        const pm = new QPixmap();
        pm.loadFromData(buffer);
        avatar.setPixmap(pm.scaled(32, 32, AspectRatioMode.KeepAspectRatio, TransformationMode.SmoothTransformation));
      });
    const uname = new QLabel(accWidget);
    uname.setObjectName('UserName');
    uname.setText(account.username);
    const disc = new QLabel(accWidget);
    disc.setObjectName('Discriminator');
    disc.setText(`#${account.discriminator}`);
    const deleteBtn = new DColorButton(DColorButtonColor.RED);
    deleteBtn.setText('Delete');
    deleteBtn.setInlineStyle('margin-right: 10px;');
    deleteBtn.setMinimumSize(0, 32);
    deleteBtn.addEventListener('clicked', () => {
      app.config.accounts = app.config.accounts.filter((v) => v !== account);
      accWidget.hide();
      this.accountsLayout.removeWidget(accWidget);
      app.saveConfig();
      this.checkEmpty();
    })
    const loginBtn = new DColorButton();
    loginBtn.setText('Login');
    loginBtn.setMinimumSize(0, 32);
    let isLoggingIn = false;
    loginBtn.addEventListener('clicked', async () => {
      if (isLoggingIn) return;
      isLoggingIn = true;
      loginBtn.setEnabled(false);
      await app.window.loadClient(account);
      loginBtn.setEnabled(true);
      isLoggingIn = false;
    })
    infoLayout.addWidget(avatar);
    infoLayout.addWidget(uname);
    infoLayout.addWidget(disc, 1);
    infoLayout.addWidget(deleteBtn);
    infoLayout.addWidget(loginBtn);
    const alPanel = new QWidget(accWidget);
    alPanel.setObjectName('AutoLoginPanel');
    const alLayout = new QBoxLayout(Direction.LeftToRight);
    alPanel.setLayout(alLayout);
    const alLabel = new QLabel(accWidget);
    alLabel.setText('Login automatically');
    alLayout.setContentsMargins(20, 15, 20, 15);
    alLabel.setAlignment(AlignmentFlag.AlignVCenter);
    const checkbox = new QPushButton(accWidget);
    const unch = new QIcon(join(__dirname, './assets/icons/checkbox-blank-outline.png'));
    const ch = new QIcon(join(__dirname, './assets/icons/checkbox-marked.png'));
    checkbox.setObjectName('CheckBox');
    checkbox.setIcon(account.autoLogin ? ch : unch);
    alPanel.setCursor(CursorShape.PointingHandCursor)
    checkbox.setIconSize(new QSize(24, 24));
    this.checkboxes.push(checkbox);
    alPanel.addEventListener(WidgetEventTypes.MouseButtonPress, () => {
      const isAutoLogin = app.config.accounts[i].autoLogin;
      this.checkboxes.forEach((c, j) => c.setIcon(i == j ? (!app.config.accounts[i].autoLogin ? ch : unch) : unch));
      app.config.accounts = app.config.accounts
        .map((acc, j) => ({ ...acc, autoLogin: i == j ? !isAutoLogin : false }));
      app.saveConfig();
    });
    alLayout.addWidget(alLabel, 1);
    alLayout.addWidget(checkbox);

    const shadow = new QGraphicsDropShadowEffect();
    shadow.setBlurRadius(5);
    shadow.setColor(new QColor(12, 12, 12, 60));
    shadow.setXOffset(-1);
    shadow.setYOffset(4);
    accWidget.setGraphicsEffect(shadow);

    layout.addWidget(info);
    layout.addWidget(alPanel, 1);
    this.accountsLayout.insertWidget(0, accWidget, 0);
  }

  private initPage() {
    const { layout } = this;
    const headerLabel = new QLabel();
    headerLabel.setObjectName('Header2');
    headerLabel.setText('Accounts');

    const addBlock = new QWidget();
    const addLayout = new QBoxLayout(Direction.LeftToRight);
    addLayout.setContentsMargins(0, 20, 0, 20);
    addLayout.setSpacing(10);
    const helpLabel = new QLabel();
    helpLabel.setObjectName('TextLabel');
    helpLabel.setText('In order to login via this client you need to retrieve an Access Token. You can obtain one using <a href="https://github.com/Tyrrrz/DiscordChatExporter/wiki/Obtaining-Token-and-Channel-IDs">this</a> guide.');
    helpLabel.setWordWrap(true);
    helpLabel.setOpenExternalLinks(true);
    const addTokenField = new DLineEdit();
    addTokenField.setPlaceholderText('Nvgd6sfgs...');
    const addButton = new DColorButton();
    addButton.setText('Add account');
    addButton.setMinimumSize(0, 32);
    let isLoggingIn = false;
    addButton.addEventListener('clicked', async () => {
      if (isLoggingIn) return;
      isLoggingIn = true;
      const token = addTokenField.text();
      addButton.setEnabled(false);
      try {
        const client = new Client();
        await client.login(token);
        if (client.user.bot) {
          await client.destroy();
          throw new Error('Bot accounts are currently not supported.');
        }
        const account = {
          username: client.user.username,
          discriminator: client.user.discriminator,
          avatar: client.user.avatarURL,
          token,
          autoLogin: false,
        };
        this.processAccount(account, app.config.accounts.length);
        app.config.accounts.push(account);
        await client.destroy();
        app.saveConfig();
      } catch (e) {
        errorMsg.setText(e.message);
        errorMsg.show();
      }
      addButton.setEnabled(true);
      this.checkEmpty();
      isLoggingIn = false;
    });
    addTokenField.setMinimumSize(0, 32);
    addBlock.setLayout(addLayout);
    addLayout.addWidget(addTokenField, 1);
    addLayout.addWidget(addButton);
    layout.addWidget(headerLabel);
    layout.addWidget(helpLabel);
    layout.addWidget(addBlock);
    const errorMsg = new QLabel();
    errorMsg.setObjectName('ErrorMessage');
    errorMsg.addEventListener(WidgetEventTypes.MouseButtonPress, () => errorMsg.hide());
    layout.addWidget(errorMsg);
    errorMsg.hide();
    const divider = new Divider();
    layout.addWidget(divider);
  }
}