/**
 * @description Generate random greeting for GotD command
 * @param greeting {string} greeting flow string
 * @param userId {string} id of discord guild member
 * */
export const gotdGreeter = (greeting: string, userId: string) =>
  `${greeting} <@${userId}>`;

export const gotdSelected = (greeting: string, username: string) =>
  `${greeting} ${username}`;
