({
  title: "Home",

  /**
   * @param {ControllerPayload} props
   * @returns {string}
   */
  get({ params }) {
    const id = params["id"];
    const data = ctx.db("user").get(id);
    return ctx.render("{{name}} is {{age}} years old", data);
  },
});
