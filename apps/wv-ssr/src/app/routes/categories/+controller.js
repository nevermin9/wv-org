({
  title: "Home",

  /**
   * @param {ControllerPayload} props
   * @returns {string}
   */
  get({ params }) {
    const id = params["id"];
    const data = ctx.db("user").get(id)
    // const data = { name: "Anton", age: 29 };
    //return ctx.render("./+page.html", data);
    return ctx.render("{{name}} is {{age}} years old", data);
  },
});
