"use strict";

/**
 * Expose compositor.
 */

module.exports = compose;

/**
 * Compose `middleware` returning
 * a fully valid middleware comprised
 * of all those which are passed.
 *
 * @param {Array} middleware
 * @return {Function}
 * @api public
 */

function compose(middleware) {
  if (!Array.isArray(middleware))
    throw new TypeError("Middleware stack must be an array!");
  for (const fn of middleware) {
    if (typeof fn !== "function")
      throw new TypeError("Middleware must be composed of functions!");
  }

  /**
   * @param {Object} context
   * @return {Promise}
   * @api public
   */

  return function(context, next) {
    // last called middleware #
    let index = -1;
    return dispatch(0);
    function dispatch(i) {
      if (i <= index)
        return Promise.reject(new Error("next() called multiple times")); // 防止多次调用 next 跳转
      index = i;
      let fn = middleware[i];
      // 当所有的中间件函数执行完毕后，执行一开始传入的 next 函数，除非特意传入，一般都是 undefined
      if (i === middleware.length) fn = next;
      if (!fn) return Promise.resolve(); // 没有 fn 的话，返回空的 resolve
      try {
        // 当使用 await next() 时，递归调用 dispatch，执行下一个中间件
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }
  };
}
