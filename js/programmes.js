// Programmes : bascule entre l'onglet "Hebdomadaire" et "Spécial"
document.addEventListener('DOMContentLoaded', () => {
    const tabWeekly = document.getElementById('tab-weekly');
    const tabSpecial = document.getElementById('tab-special');
    const weeklyPane = document.getElementById('weekly-pane');
    const specialPane = document.getElementById('special-pane');

    const switchTab = (activeTab, inactiveTab, activePane, inactivePane) => {
        activeTab.classList.add('active');
        activeTab.setAttribute('aria-selected', 'true');

        inactiveTab.classList.remove('active');
        inactiveTab.setAttribute('aria-selected', 'false');

        activePane.classList.add('active');
        inactivePane.classList.remove('active');
    };

    tabWeekly.addEventListener('click', () => {
        switchTab(tabWeekly, tabSpecial, weeklyPane, specialPane);
    });

    tabSpecial.addEventListener('click', () => {
        switchTab(tabSpecial, tabWeekly, specialPane, weeklyPane);
    });
});
