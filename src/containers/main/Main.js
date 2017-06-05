import React, { Component } from 'react';
import './main.css';
import FloatingButton from '../../components/FloatingButton';

export default class Main extends Component {
  render() {
    return (<div>
      <FloatingButton showBookingButton history={this.props.history}/>
    	   <section  className="">
	        <article role="main" className="main-pan">
	          <header className="page-title">
	            <h2>Головна</h2>
	          </header>
			        <p>Ми команда талановитих молодих людей з креативними ідеями, котрі прагнемо втілювати в життя. <br/> Ми працюємо, щоб ви відчували себе впевнено
			          і довіряли нам  на 100%.<br/> У студії eleven Ви знайдете широкий спектр перукарських послуг, послуги макіяжу та художнього манікюру за доступними цінами.<br/>
			          Незабаром відкриємось, тому підписуйтесь на новини та будьте першими щоб забронювати візит онлайн!<br/>
			        </p>
	           </article>
      </section>
    </div>)
}
}