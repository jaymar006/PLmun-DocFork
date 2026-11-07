/* Temporary headless smoke harness for the wizard calendar. */
(function () {
  const res = [];
  const ok = (c, m) => res.push((c ? 'PASS' : 'FAIL') + ' - ' + m);
  const q = s => document.querySelector(s);
  const qa = s => Array.from(document.querySelectorAll(s));

  try {
    localStorage.clear();
    sessionStorage.clear();
    Store.init();
    Auth.restore();
    UI.render();

    ok(qa('[data-act="requestDoc"]').length === 12, 'landing lists 12 requestable forms');

    const r = Auth.login('student@plmun.edu.ph', 'student123');
    ok(r && r.ok, 'student login works');
    const u = Auth.user;
    delete u.warningAck;
    UI.render();
    ok(q('#warning').open, 'warning gate opens for student without ack');
    q('#warnAck').checked = true;
    Actions.ackWarning();
    ok(!q('#warning').open && isAcked(u), 'acknowledgement persists');

    UI.wizard = null;
    const w = UI.wizardFor(u);
    w.step = 4;
    w.purpose = 'Employment verification';
    w.doc = 'Certificate of Grades';
    UI.renderWizard();

    ok(!!q('.wiz-sched .calendar'), 'step 4 renders an inline calendar');
    ok(!q('#wizDate') && !q('#wizTime'), 'native date input and time dropdown removed');
    ok(q('#wizNext').disabled, 'submit disabled before date/time');
    ok(!!q('.wiz-sched .slots-hint'), 'time panel prompts for a date');
    ok(q('[data-act="wizCalPrev"]').disabled, 'cannot navigate before current month');

    const beforeMonth = UI.wizard.view.getMonth();
    Actions.wizCalNext();
    const afterMonth = UI.wizard.view.getMonth();
    ok(afterMonth !== beforeMonth, 'next month navigates calendar');
    Actions.wizCalPrev();
    ok(UI.wizard.view.getMonth() === beforeMonth, 'previous month returns');

    const day = q('.wiz-sched .cal-day[data-act="wizPickDate"]:not([disabled])');
    ok(!!day, 'a bookable date exists in the calendar');
    const date = day.dataset.date;
    Actions.wizPickDate(day);
    ok(UI.wizard.date === date && UI.wizard.time === '', 'date selection updates state and clears time');
    ok(q('.wiz-review').textContent.includes(fmtDate(dateFromKey(date))), 'summary shows the chosen date');
    ok(q('#wizNext').disabled, 'submit still disabled until a time is chosen');

    const slot = q('.wiz-sched .slot[data-act="wizPickSlot"]:not([disabled])');
    ok(!!slot, 'time slots render inside the scheduler panel');
    const time = slot.dataset.time;
    Actions.wizPickSlot(slot);
    ok(UI.wizard.time === time, 'time selection updates state');
    ok(q('.wiz-review').textContent.includes(timeLabel(time)), 'summary shows the chosen time');
    ok(!q('#wizNext').disabled, 'submit enabled with both date and time');
    ok(!!q('.wiz-sched .slot.is-selected'), 'selected time is highlighted');

    const beforeCount = Store.db.requests.length;
    Actions.wizNext();
    ok(Store.db.requests.length === beforeCount + 1, 'submission creates a request');
    const req = Store.db.requests[0];
    ok(req.pickup && req.pickup.date === date && req.pickup.time === time, 'pickup reserved with chosen date/time');
    ok(!q('#wizardCard .wiz-sched'), 'wizard resets after submission');
    ok(!!req.trackingCode && req.trackingCode.startsWith('PLM-TRK-'), 'created request has tracking reference code');

    // Student tracking reference code and receipt tests
    const headers = qa('table th').map(th => th.textContent.trim());
    ok(headers.includes('Tracking Ref'), 'student table has Tracking Ref header');
    ok(headers.includes('Actions'), 'student table has Actions header');

    const trkCells = qa('.trk-code');
    ok(trkCells.length > 0, 'student requests render tracking reference codes');
    ok(trkCells[0].textContent.startsWith('PLM-TRK-'), 'tracking reference code format is valid');

    const receiptBtns = qa('[data-act="viewReceipt"]');
    ok(receiptBtns.length > 0, 'student table renders print receipt buttons');

    // Click print receipt button
    Actions.viewReceipt(receiptBtns[0]);
    ok(q('#receipt').open, 'receipt dialog opens when print receipt button is clicked');
    ok(!!q('#receipt .qr-svg'), 'official receipt renders scannable QR code SVG');
    ok(q('#receipt .receipt-highlight').textContent.trim() === trkCells[0].textContent.trim(), 'receipt tracking code matches table row');

    let printTriggered = false;
    window.print = () => { printTriggered = true; };
    Actions.printReceipt();
    ok(printTriggered, 'print receipt triggers browser window.print()');
    q('#receipt').close();

    const de = document.documentElement;
    ok(de.scrollWidth <= de.clientWidth + 1, 'no horizontal page overflow at ' + de.clientWidth + 'px');

    // Admin document deletion test
    window.confirm = () => true;
    Auth.logout();
    const adminLog = Auth.login('admin@plmun.edu.ph', 'admin123');
    ok(adminLog && adminLog.ok, 'admin login works');
    UI.render();
    const deleteBtns = qa('[data-act="deleteDoc"]');
    ok(deleteBtns.length > 0, 'admin table renders delete buttons for document types');
    const docToDelete = deleteBtns[0].dataset.doc;
    const initialDocCount = Store.db.docs.length;
    Actions.deleteDoc(deleteBtns[0]);
    ok(Store.db.docs.length === initialDocCount - 1, 'admin deleting form removes it from store');
    ok(!Store.db.docs.includes(docToDelete), 'deleted form is no longer in store.db.docs');
    ok(Store.db.deletedDocs.includes(docToDelete), 'deleted form is tracked in store.db.deletedDocs');
  } catch (e) {
    res.push('ERROR - ' + (e && e.stack ? e.stack : e));
  }

  const pre = document.createElement('pre');
  pre.id = 'smoke';
  pre.textContent = res.join('\n');
  document.body.appendChild(pre);
})();
