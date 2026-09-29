/**
 * Admin Team & Department Contacts Controller
 * Manages multi-member / department contact directory, sample loader, custom contact add/remove, and live sync.
 */

(function () {
  'use strict';

  const SAMPLE_CONTACTS = [
    {
      name: 'Ramesh Sharma',
      role: 'Booking & Reservations',
      phone: '+91 98765 43210',
      whatsapp: true,
      note: '9:00 AM - 10:00 PM'
    },
    {
      name: 'Vikram Singh',
      role: 'Fleet & Cab Dispatch',
      phone: '+91 98765 43211',
      whatsapp: true,
      note: '24/7 On-Road Helpline'
    },
    {
      name: 'Priya Patel',
      role: 'Holiday & Tour Specialist',
      phone: '+91 98765 43212',
      whatsapp: true,
      note: 'Custom Packages & Quotations'
    },
    {
      name: 'Accounts & Billing Desk',
      role: 'Invoices & Corporate Accounts',
      phone: '+91 98765 43213',
      whatsapp: false,
      note: '10:00 AM - 6:00 PM (Mon-Sat)'
    }
  ];

  let currentContacts = [];
  let onSyncCallback = null;

  function getInitials(name) {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  const AVATAR_COLORS = [
    { bg: '#EFF6FF', text: '#1D4ED8' },
    { bg: '#F0FDF4', text: '#15803D' },
    { bg: '#FDF2F8', text: '#BE185D' },
    { bg: '#FFF7ED', text: '#C2410C' },
    { bg: '#F5F3FF', text: '#6D28D9' },
    { bg: '#ECFEFF', text: '#0E7490' }
  ];

  window.AdminTeamContacts = {
    init({ onSync }) {
      onSyncCallback = onSync;

      const inputTitle = document.getElementById('inputTeamContactsTitle');
      const inputSubtitle = document.getElementById('inputTeamContactsSubtitle');
      const btnLoadSample = document.getElementById('btnLoadSampleTeamContacts');
      const btnToggleAdd = document.getElementById('btnToggleAddTeamContact');
      const btnConfirmAdd = document.getElementById('btnConfirmAddTeamContact');
      const btnCancelAdd = document.getElementById('btnCancelAddTeamContact');
      const addPanel = document.getElementById('addTeamContactPanel');

      const newName = document.getElementById('newContactPersonName');
      const newRole = document.getElementById('newContactPersonRole');
      const newPhone = document.getElementById('newContactPersonPhone');
      const newWhatsapp = document.getElementById('newContactPersonWhatsapp');
      const newNote = document.getElementById('newContactPersonNote');

      [inputTitle, inputSubtitle].forEach(inp => {
        if (inp) {
          inp.addEventListener('input', () => onSyncCallback && onSyncCallback());
        }
      });

      if (btnLoadSample) {
        btnLoadSample.addEventListener('click', () => {
          currentContacts = JSON.parse(JSON.stringify(SAMPLE_CONTACTS));
          this.render();
          if (onSyncCallback) onSyncCallback();
        });
      }

      if (btnToggleAdd) {
        btnToggleAdd.addEventListener('click', () => {
          if (!addPanel || addPanel.style.display === 'none') {
            if (addPanel) addPanel.style.display = 'block';
            if (newName) { newName.value = ''; newName.focus(); }
            if (newRole) newRole.value = '';
            if (newPhone) newPhone.value = '';
            if (newWhatsapp) newWhatsapp.checked = true;
            if (newNote) newNote.value = '';
          } else {
            if (addPanel) addPanel.style.display = 'none';
          }
        });
      }

      if (btnCancelAdd) {
        btnCancelAdd.addEventListener('click', () => {
          if (addPanel) addPanel.style.display = 'none';
        });
      }

      const handleAdd = () => {
        if (!newName || !newPhone) return;
        const nameVal = newName.value.trim();
        const phoneVal = newPhone.value.trim();

        if (!nameVal) {
          alert('Please enter a Contact / Person Name.');
          newName.focus();
          return;
        }

        if (!phoneVal) {
          alert('Please enter a Phone Number.');
          newPhone.focus();
          return;
        }

        const roleVal = (newRole && newRole.value.trim()) || '';
        const whatsappVal = newWhatsapp ? !!newWhatsapp.checked : true;
        const noteVal = (newNote && newNote.value.trim()) || '';

        currentContacts.push({
          name: nameVal,
          role: roleVal,
          phone: phoneVal,
          whatsapp: whatsappVal,
          note: noteVal
        });

        if (addPanel) addPanel.style.display = 'none';
        newName.value = '';
        if (newRole) newRole.value = '';
        newPhone.value = '';
        if (newNote) newNote.value = '';

        this.render();
        if (onSyncCallback) onSyncCallback();
      };

      if (btnConfirmAdd) btnConfirmAdd.addEventListener('click', handleAdd);

      [newName, newRole, newPhone, newNote].forEach(inp => {
        if (inp) {
          inp.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          });
        }
      });

      this.render();
    },

    render() {
      const container = document.getElementById('teamContactsAdminList');
      const countEl = document.getElementById('teamContactsCount');
      if (countEl) countEl.textContent = currentContacts.length;
      if (!container) return;

      container.innerHTML = '';
      if (currentContacts.length === 0) {
        container.innerHTML = `
          <div style="padding: 16px; background: #F4F4F5; border-radius: 8px; text-align: center; font-size: 0.78rem; color: #71717A;">
            No contacts added yet. Click <strong>+ Load Sample Contacts</strong> or <strong>+ Add New Contact</strong> to add department members or phone numbers.
          </div>
        `;
        return;
      }

      currentContacts.forEach((contact, index) => {
        const card = document.createElement('div');
        const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
        const initials = getInitials(contact.name);

        card.style.cssText = 'position: relative; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 14px; background: #FFFFFF; border: 1px solid #E4E4E7; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);';

        card.innerHTML = `
          <div style="display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1;">
            <div style="width: 36px; height: 36px; border-radius: 50%; background: ${color.bg}; color: ${color.text}; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.78rem; flex-shrink: 0; letter-spacing: -0.02em;">
              ${initials}
            </div>
            <div style="min-width: 0; flex: 1;">
              <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                <span style="font-weight: 600; font-size: 0.84rem; color: #18181B; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${contact.name}</span>
                ${contact.role ? `<span style="font-size: 0.68rem; font-weight: 600; padding: 2px 7px; border-radius: 12px; background: #F1F5F9; color: #475569; white-space: nowrap;">${contact.role}</span>` : ''}
              </div>
              <div style="display: flex; align-items: center; gap: 8px; font-size: 0.74rem; color: #52525B; margin-top: 3px; flex-wrap: wrap;">
                <span style="font-family: monospace; font-weight: 600; color: #0284C7; display: flex; align-items: center; gap: 3px;">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  ${contact.phone}
                </span>
                ${contact.whatsapp ? `<span style="font-size: 0.66rem; background: #DCFCE7; color: #15803D; font-weight: 600; padding: 1px 6px; border-radius: 4px;">WhatsApp</span>` : ''}
                ${contact.note ? `<span style="color: #71717A; font-size: 0.71rem;">• ${contact.note}</span>` : ''}
              </div>
            </div>
          </div>
          <button type="button" class="vehicle-remove-btn" title="Remove Contact" style="position: static; flex-shrink: 0; width: 24px; height: 24px; border-radius: 50%; background: #FEE2E2; color: #DC2626; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: bold; line-height: 1;">&times;</button>
        `;

        card.querySelector('.vehicle-remove-btn').addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          currentContacts.splice(index, 1);
          this.render();
          if (onSyncCallback) onSyncCallback();
        });

        container.appendChild(card);
      });
    },

    getData() {
      const inputTitle = document.getElementById('inputTeamContactsTitle');
      const inputSubtitle = document.getElementById('inputTeamContactsSubtitle');
      return {
        title: (inputTitle && inputTitle.value.trim()) || 'Contact Directory',
        subtitle: (inputSubtitle && inputSubtitle.value.trim()) || 'Direct phone & WhatsApp contacts for our specialized desks',
        contacts: currentContacts
      };
    },

    setData(teamData) {
      const inputTitle = document.getElementById('inputTeamContactsTitle');
      const inputSubtitle = document.getElementById('inputTeamContactsSubtitle');
      if (!teamData) {
        this.reset();
        return;
      }
      if (inputTitle && teamData.title !== undefined) {
        inputTitle.value = teamData.title;
      }
      if (inputSubtitle && teamData.subtitle !== undefined) {
        inputSubtitle.value = teamData.subtitle;
      }
      currentContacts = Array.isArray(teamData.contacts) ? JSON.parse(JSON.stringify(teamData.contacts)) : [];
      this.render();
    },

    reset() {
      const inputTitle = document.getElementById('inputTeamContactsTitle');
      const inputSubtitle = document.getElementById('inputTeamContactsSubtitle');
      if (inputTitle) inputTitle.value = 'Contact Directory';
      if (inputSubtitle) inputSubtitle.value = 'Direct phone & WhatsApp contacts for our specialized desks';
      currentContacts = [];
      const addPanel = document.getElementById('addTeamContactPanel');
      if (addPanel) addPanel.style.display = 'none';
      this.render();
    }
  };
})();
