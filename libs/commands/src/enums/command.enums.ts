export enum COMMAND_ENUMS {
  FEFENYA_GOTD = 'gay',
  FEFENYA_GOTD_RU = 'пидор',
  FEFENYA_GOTS_STATS = 'gaylords',
  FEFENYA_GOTS_STATS_RU = 'пидоры дня',
  BINDING = 'bind',
  VOTING = 'vote',
  VOTING_SANCTIONS = 'vote-sanction',
  MEMORIAL = 'memorial',
}

export enum COMMAND_DESCRIPTION_ENUMS {
  FEFENYA_GOTD = 'Choose hero of the day',
  FEFENYA_GOTD_RU = 'Выбрать пидора дня',
  FEFENYA_GOTD_STATS = 'Show heroes of glory hall',
  FEFENYA_GOTD_STATS_RU = 'Показать пидоров дня',
  BINDING = 'Bind or make visible selected entity role | user | channel to bot',
  VOTING = 'Start voting for the selected proposal',
  VOTING_SANCTIONS = 'Инициировать процедуру голосования за применение санкций к участнику сервера',
  MEMORIAL = 'Show memorial wall',
}

export enum VOTING_SANCTIONS_PARAMS {
  ACTION = 'санкции',
  USER = 'участник',
}

export enum VOTING_SANCTIONS_DESCRIPTION {
  ACTION_DESCRIPTION = 'санкционированное действие',
  USER_DESCRIPTION = 'участник сервера',
}

export enum VOTING_ACTION_PARAMS {
  MUTE = 'Мут',
  KICK = 'Изгнать',
  BAN = 'Забанить',
}
