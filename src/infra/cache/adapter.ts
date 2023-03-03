import { MemoryCacheSetType } from './memory/types';
import { RedisCacheKeyArgument, RedisCacheKeyValue, RedisCacheValeuArgument } from './redis/types';

export abstract class ICacheAdapter<T = object> {
  client: T;

  abstract isConnected(): Promise<void> | void;

  abstract connect(): Promise<T> | T;

  abstract set<
    TKey extends RedisCacheKeyArgument = RedisCacheKeyArgument,
    TValeu extends RedisCacheValeuArgument = RedisCacheValeuArgument,
    TConf extends object = object
  >(key: TKey, value: TValeu, config?: TConf): Promise<void> | void;

  abstract del<TKey extends RedisCacheKeyArgument = RedisCacheKeyArgument>(key: TKey): Promise<void> | boolean;

  abstract get<TKey extends RedisCacheKeyArgument = RedisCacheKeyArgument>(key: TKey): Promise<string> | string;

  abstract setMulti(redisList?: RedisCacheKeyValue[]): Promise<void>;

  abstract pExpire<PCache extends RedisCacheKeyArgument = RedisCacheKeyArgument>(
    key: PCache,
    miliseconds: number
  ): Promise<void> | boolean;

  abstract hGet<
    TKey extends RedisCacheKeyArgument = RedisCacheKeyArgument,
    TArs extends RedisCacheKeyArgument = RedisCacheKeyArgument
  >(key?: TKey, field?: TArs): Promise<unknown | unknown[]> | void;

  abstract hSet<
    TKey extends RedisCacheKeyArgument = RedisCacheKeyArgument,
    TArgs extends RedisCacheKeyArgument = RedisCacheKeyArgument,
    TValue extends RedisCacheValeuArgument = RedisCacheValeuArgument
  >(key?: TKey, field?: TArgs, value?: TValue): Promise<number> | void;

  abstract hGetAll<TKey extends RedisCacheKeyArgument = RedisCacheKeyArgument>(
    key: TKey
  ): Promise<unknown | unknown[]> | void;

  abstract mSet<TSet extends MemoryCacheSetType = MemoryCacheSetType>(model?: TSet[]): boolean;

  abstract mGet(key?: string[]): unknown | null;

  abstract has(key?: string | number): boolean;
}
