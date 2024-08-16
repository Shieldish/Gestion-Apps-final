import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const AboutUsScreen = () => {
    return (
        <View style={styles.wrapper}>
            <ScrollView style={styles.content}>
                {/* Main content area */}
                <View style={styles.mainContent}>
                    {/* Your content here */}
                    <Text style={styles.title}>GESTION STAGES</Text>
                    <Text style={styles.paragraph}>
                        Option 1 : Présentation concise et percutante
                        Gestion simplifiée de vos stages
                    </Text>
                    <Text style={styles.paragraph}>
                        Simplifiez la gestion de vos stages avec notre application intuitive ! Du recrutement des stagiaires à l'évaluation finale, toutes les étapes sont centralisées. Gagnez du temps et optimisez votre suivi.
                    </Text>
                    <Text style={styles.paragraph}>
                        Option 2 : Axée sur les bénéfices pour l'utilisateur
                        Dites adieu aux tâches administratives
                    </Text>
                    <Text style={styles.paragraph}>
                        Notre application révolutionne la gestion des stages. En automatisant les processus, vous libérez du temps pour vous concentrer sur l'essentiel : l'accompagnement de vos stagiaires.
                    </Text>
                    <Text style={styles.subTitle}>Les avantages clés :</Text>
                    <Text style={styles.listItem}>
                        • Centralisation des données : Accédez à toutes les informations en un seul endroit.
                    </Text>
                    <Text style={styles.listItem}>
                        • Suivi personnalisé : Suivez l'évolution de chaque stagiaire en temps réel.
                    </Text>
                    <Text style={styles.listItem}>
                        • Communication facilitée : Échangez avec les stagiaires et les tuteurs en toute simplicité.
                    </Text>
                    <Text style={styles.listItem}>
                        • Évaluation simplifiée : Générez des rapports personnalisés en quelques clics.
                    </Text>
                    <Text style={styles.paragraph}>
                        Option 3 : Ciblant les établissements d'enseignement
                        Une solution complète pour les établissements
                    </Text>
                    <Text style={styles.paragraph}>
                        Facilitez la mise en place de stages de qualité pour vos étudiants. Notre application vous permet de :
                    </Text>
                    <Text style={styles.listItem}>
                        • Publier des offres de stage auprès d'un large réseau d'entreprises.
                    </Text>
                    <Text style={styles.listItem}>
                        • Suivre les stages en temps réel et garantir leur bon déroulement.
                    </Text>
                    <Text style={styles.listItem}>
                        • Évaluer les compétences acquises par les étudiants.
                    </Text>
                    <Text style={styles.listItem}>
                        • Améliorer l'insertion professionnelle de vos diplômés.
                    </Text>
                    <Text style={styles.paragraph}>
                        Option 4 : Mettant en avant les fonctionnalités techniques
                        Une application sur mesure pour vos besoins
                    </Text>
                    <Text style={styles.paragraph}>
                        Notre application intègre de nombreuses fonctionnalités pour répondre à vos besoins spécifiques :
                    </Text>
                    <Text style={styles.listItem}>
                        • Base de données de stages personnalisable
                    </Text>
                    <Text style={styles.listItem}>
                        • Module de suivi des conventions de stage
                    </Text>
                    <Text style={styles.listItem}>
                        • Outil de génération de rapports
                    </Text>
                    <Text style={styles.listItem}>
                        • Intégration avec votre système d'information
                    </Text>
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                {/* Section: Social media */}
                <View style={styles.socialMediaSection}>
                    <Text style={styles.myText}>Get connected with us on social networks:</Text>
                    <View style={styles.socialLinks}>
                        {/* Social links */}
                        <TouchableOpacity style={styles.socialLink}>
                            <Icon name="facebook" size={30} color="#3b5998" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialLink}>
                            <Icon name="twitter" size={30} color="#1da1f2" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialLink}>
                            <Icon name="google" size={30} color="#ea4335" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialLink}>
                            <Icon name="instagram" size={30} color="#c32aa3" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialLink}>
                            <Icon name="linkedin" size={30} color="#0077b5" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialLink}>
                            <Icon name="github" size={30} color="#333" />
                        </TouchableOpacity>
                    </View>
                </View>
                
                {/* Section: Links */}
                <View style={styles.linksSection}>
                    <Text style={styles.linksHeader}>Programs</Text>
                    <Text style={styles.link}>Planning</Text>
                    <Text style={styles.link}>Affectation/Encadrement</Text>
                    <Text style={styles.link}>Stages</Text>
                    <Text style={styles.link}>Soutenance</Text>
                </View>
                
                {/* Additional links and contact */}
                <View style={styles.contactSection}>
                    <Text style={styles.linksHeader}>Useful links</Text>
                    <Text style={styles.link}>Admin</Text>
                    <Text style={styles.link}>Settings</Text>
                    <Text style={styles.link}>Orders</Text>
                    <Text style={styles.link}>Help</Text>
                    
                    <Text style={styles.linksHeader}>Contact</Text>
                    <Text><Icon name="home" style={styles.icon} /> Sfax, Rue Soukra km3 fss-sfax, Tunisie</Text>
                    <Text><Icon name="envelope" style={styles.icon} /> kossisamuel.gabiam@fss.u-sfax.tn</Text>
                    <Text><Icon name="phone" style={styles.icon} /> +216 11223344</Text>
                    <Text><Icon name="fax" style={styles.icon} /> +216 22334455</Text>
                </View>
                
                {/* Copyright */}
                <View style={styles.copyright}>
                    <Text>&copy; 2024 Gestion des Stages. All rights reserved.</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    mainContent: {
        padding: 20,
        backgroundColor: '#ffffff',
    },
    footer: {
        backgroundColor: '#f8f9fa',
        paddingVertical: 20,
    },
    socialMediaSection: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    socialLinks: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
    },
    socialLink: {
        marginHorizontal: 10,
    },
    linksSection: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    linksHeader: {
        fontWeight: 'bold',
        marginBottom: 10,
        fontSize: 18,
    },
    link: {
        marginBottom: 5,
        fontSize: 16,
        color: '#007bff',
    },
    contactSection: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    icon: {
        marginRight: 5,
        fontSize: 16,
        color: '#6c757d',
    },
    copyright: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 24,
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
    },
    paragraph: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 10,
        color: '#4a4a4a',
    },
    subTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    listItem: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 10,
        color: '#4a4a4a',
    },
    myText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    }
});

export default AboutUsScreen;
