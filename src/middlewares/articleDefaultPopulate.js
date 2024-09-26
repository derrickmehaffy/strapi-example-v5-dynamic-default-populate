"use strict";

/**
 * `articleDefaultPopulate` middleware
 */

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    const contentType = strapi.contentTypes["api::article.article"];
    const populate = {};

    for (let i = 0; i < Object.keys(contentType.attributes).length; i++) {
      let attribute = Object.keys(contentType.attributes)[i];

      if (
        ["relation", "dynamiczone", "component", "media"].includes(
          contentType.attributes[attribute].type
        ) &&
        !["createdBy", "updatedBy"].includes(attribute)
      ) {
        if (
          ["relation", "media"].includes(contentType.attributes[attribute].type)
        ) {
          populate[attribute] = true;
        }

        if (contentType.attributes[attribute].type === "dynamiczone") {
          for (
            let e = 0;
            e < contentType.attributes[attribute].components.length;
            e++
          ) {
            const componentName =
              contentType.attributes[attribute].components[e];
            const component = strapi.components[componentName];

            for (let j = 0; j < Object.keys(component.attributes).length; j++) {
              if (
                ["relation", "component", "media"].includes(
                  component.attributes[Object.keys(component.attributes)[j]]
                    .type
                )
              ) {
                populate[attribute] = {
                  on: {
                    ...populate[attribute]?.on,
                    [contentType.attributes[attribute].components[e]]: {
                      populate: {
                        ...populate[attribute]?.on?.[
                          contentType.attributes[attribute].components[e]
                        ]?.populate,
                        [Object.keys(component.attributes)[j]]: true,
                      },
                    },
                  },
                };
              } else {
                populate[attribute] = {
                  on: {
                    ...populate[attribute]?.on,
                    [contentType.attributes[attribute].components[e]]: true,
                  },
                };
              }
            }
          }
        }
      }
    }

    ctx.query.populate = populate;

    await next();
  };
};
