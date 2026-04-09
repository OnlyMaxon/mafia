import type { Role, GameRoles, Player } from '../types/game';

// Генерирует случайный код комнаты
export const generateGameCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Создает массив ролей на основе настроек
export const createRolesArray = (roles: GameRoles): Role[] => {
  const rolesArray: Role[] = [];
  
  rolesArray.push(...Array(roles.mafia).fill('mafia'));
  rolesArray.push(...Array(roles.sheriff).fill('sheriff'));
  rolesArray.push(...Array(roles.doctor).fill('doctor'));
  rolesArray.push(...Array(roles.maniac).fill('maniac'));
  rolesArray.push(...Array(roles.prostitute).fill('prostitute'));
  rolesArray.push(...Array(roles.civilian).fill('civilian'));
  
  return rolesArray;
};

// Перемешивает роли случайным образом
export const shuffleRoles = (roles: Role[]): Role[] => {
  const shuffled = [...roles];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Раздает роли игрокам
export const assignRolesToPlayers = (
  players: Player[],
  roles: GameRoles
): Player[] => {
  const rolesArray = createRolesArray(roles);
  const shuffledRoles = shuffleRoles(rolesArray);
  
  return players.map((player, index) => ({
    ...player,
    role: shuffledRoles[index]
  }));
};

// Проверяет, что сумма ролей равна количеству игроков
export const validateRolesSum = (roles: GameRoles, playerCount: number): boolean => {
  const sum = roles.mafia + roles.sheriff + roles.doctor + roles.maniac + 
              roles.prostitute + roles.civilian;
  return sum === playerCount;
};

// Получает описание роли на русском
export const getRoleDescription = (role: Role): string => {
  const descriptions: Record<Role, string> = {
    mafia: 'Убивает по ночам',
    sheriff: 'Раскрывает по дню',
    doctor: 'Спасает по ночам',
    maniac: 'Убивает каждую ночь (даже мафии)',
    prostitute: 'Блокирует ночью',
    civilian: 'Обычная роль'
  };
  return descriptions[role];
};

// Получает русское название роли
export const getRoleNameRu = (role: Role): string => {
  const names: Record<Role, string> = {
    mafia: 'Мафия',
    sheriff: 'Шериф',
    doctor: 'Доктор',
    maniac: 'Маньяк',
    prostitute: 'Путана',
    civilian: 'Мирный'
  };
  return names[role];
};
