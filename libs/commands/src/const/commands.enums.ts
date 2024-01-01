export enum COMMAND_ENUMS {
  FEFENYA_TROPHY = 'trophy',
  FEFENYA_TROPHY_RU = 'приз',
  FEFENYA_TOP = 'top',
  FEFENYA_TOP_RU = 'топ-дня',
  BINDING = 'bind',
  VOTING = 'vote',
  VOTING_SANCTIONS = 'vote-sanction',
  VOTING_NOMINATION = 'vote-nomination',
  MEMORIAL = 'memorial',
  CRYPTO = 'crypto',
}

export enum COMMAND_DESCRIPTION_ENUMS {
  FEFENYA_TROPHY = 'Choose winner of the day',
  FEFENYA_TROPHY_RU = 'Выбрать победителя дня',
  FEFENYA_TOP = 'Show top ladder',
  FEFENYA_TOP_RU = 'Показать топ победителей',
  BINDING = 'Bind or make visible selected entity role | user | channel to bot',
  VOTING = 'Start voting for the selected proposal',
  VOTING_NOMINATION = 'Инициировать процедуру голосования за присвоение роли к выбранному участнику сообщества',
  VOTING_SANCTIONS = 'Инициировать процедуру голосования за применение санкций к участнику сообщества',
  MEMORIAL = 'Show memorial wall',
  CRYPTO = 'Зашифровать или дешифровать выбранное сообщение',
}

export enum TROPHY_PARAMS_ENUM {
  ROLE = 'role',
  TROPHY = 'trophy',
}

export enum GOTD_PARAMS_DESCRIPTION_ENUM {
  ROLE = 'Выбери подарочную роль для победителя',
  TROPHY = 'Назови что разыгрываем, требуется только 1 раз!',
}

export enum BINDING_PARAMS_ENUM {
  ROLE = 'role',
  USER = 'user',
  CHANNEL = 'channel',
  GUILD = 'guild',
}

export enum BINDING_PARAMS_DESCRIPTION_ENUM {
  ROLE = 'Binds role, allowing bot to operate with selected entity',
  USER = 'Binds user, allowing bot to operate with selected entity',
  CHANNEL = 'Binds channel, allowing bot to operate with selected entity',
  GUILD = 'Binds guild, allowing bot to operate with selected entity',
}

export enum VOTING_NOMINATION_PARAMS {
  USER = 'участник',
  ROLE = 'роль',
}

export enum VOTING_NOMINATION_DESCRIPTION {
  ROLE_DESCRIPTION = 'номинированная роль',
  USER_DESCRIPTION = 'участник сообщества',
}

export enum VOTING_SANCTIONS_PARAMS {
  ACTION = 'санкции',
  USER = 'участник',
}

export enum VOTING_SANCTIONS_DESCRIPTION {
  ACTION_DESCRIPTION = 'санкционированное действие',
  USER_DESCRIPTION = 'участник сообщества',
}

export enum VOTING_ACTION_PARAMS {
  MUTE = 'Мут',
  KICK = 'Изгнать',
  BAN = 'Забанить',
  UNBAN = 'Разбанить',
  UNMUTE = 'Размутать',
}
