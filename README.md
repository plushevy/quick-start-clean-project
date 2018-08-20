# quick-start-clean-project

Шаблон пустого проекта с SCSS и GULP

Рабочая сборка с минификацией css и js.
Для использования плагина include использовать такой синтаксис в HTML:

  <!-- вставка svg инлайново -->
  <div style="display:none">
    <include src="img/sprite.svg"></include>
  </div>

  <include src = "/templates/header.html"></include>
  <include src="templates/footer.html"></include>


  Помимо стандартной структуры папок:
  /templates  -часто используемые куски html(header, footer)
  robots.txt
  .htaccess
  .editorconfig
  .browserslistrc -настройки autoprefixer



  Запуск и установка: 
1) Полсе копирования проекта запустить к командной строке
npm i

2) Запуск автоматизации
npm start
